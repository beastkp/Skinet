using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skinet.API.DTOs;
using Skinet.API.Extensions;
using Skinet.Core.Entities;
using Skinet.Core.Entities.OrderAggregate;
using Skinet.Core.Interfaces;
using Skinet.Core.Specifications;

namespace Skinet.API.Controllers
{
    [Authorize]
    public class OrdersController(ICartService cartService, IUnitOfWork unit) : BaseApiController
    {
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
        {
            var email = User.GetEmail();
            var cart = await cartService.GetCartAsync(orderDto.CartId);

            if (cart == null) return BadRequest("Cart not found");
            if (cart.PaymentIntentId == null) return BadRequest("No payment intent for this order");

            var deliveryMethod = await unit.Repository<DeliveryMethod>().GetByIdAsync(orderDto.DeliveryMethodId);
            if (deliveryMethod == null) return BadRequest("No delivery method selected");

            var items = new List<OrderItem>();
            foreach (var item in cart.Items)
            {
                var productItem = await unit.Repository<Product>().GetByIdAsync(item.ProductId);
                if (productItem == null) return BadRequest("Problem with order");

                var orderedItem = new ProductItemOrdered
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    PictureUrl = item.PictureUrl
                };

                items.Add(new OrderItem
                {
                    ItemOrdered = orderedItem,
                    Price = productItem.Price,
                    Quantity = item.Quantity
                });
            }

            var subtotal = items.Sum(x => x.Price * x.Quantity);

            // look for an existing order tied to this PaymentIntent (retry / re-attempt)
            var spec = new OrderSpecification(cart.PaymentIntentId, true);
            var existingOrder = await unit.Repository<Order>().GetEntityWithSpec(spec);

            if (existingOrder != null)
            {
                // don't touch orders that already reflect a completed payment
                if (existingOrder.Status != OrderStatus.Pending)
                    return BadRequest("Order already processed for this payment");

                existingOrder.OrderItems = items;
                existingOrder.DeliveryMethod = deliveryMethod;
                existingOrder.ShippingAddress = orderDto.ShippingAddress;
                existingOrder.Subtotal = subtotal;
                existingOrder.PaymentSummary = orderDto.PaymentSummary;

                unit.Repository<Order>().Update(existingOrder);

                if (await unit.Complete()) return existingOrder;
                return BadRequest("Problem updating order");
            }

            var order = new Order
            {
                OrderItems = items,
                DeliveryMethod = deliveryMethod,
                ShippingAddress = orderDto.ShippingAddress,
                Subtotal = subtotal,
                PaymentSummary = orderDto.PaymentSummary,
                PaymentIntentId = cart.PaymentIntentId,
                BuyerEmail = email,
                Status = OrderStatus.Pending
            };

            unit.Repository<Order>().Add(order);

            if (await unit.Complete()) return order;
            return BadRequest("Problem creating order");
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Order>>> GetOrdersForUser()
        {
            var spec = new OrderSpecification(User.GetEmail());

            var orders = await unit.Repository<Order>().ListAsync(spec);

            var ordersToReturn = orders.Select(o => o.ToDto()).ToList();

            return Ok(ordersToReturn);

        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            var spec = new OrderSpecification(User.GetEmail(), id);

            var order = await unit.Repository<Order>().GetEntityWithSpec(spec);

            if (order == null) return NotFound();

            return order.ToDto();
        }


    }
}
