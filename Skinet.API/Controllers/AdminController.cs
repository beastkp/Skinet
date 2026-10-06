using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skinet.API.DTOs;
using Skinet.API.Extensions;
using Skinet.Core.Entities.OrderAggregate;
using Skinet.Core.Interfaces;
using Skinet.Core.Specifications;

namespace Skinet.API.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController(IUnitOfWork units, IPaymentService paymentService) : BaseApiController
    {
        [HttpGet("orders")]
        public async Task<ActionResult<IReadOnlyList<Order>>> GetOrders([FromQuery] OrderSpecParams specParams)
        {
            var spec = new OrderSpecification(specParams);
            return await CreatePageResult(units.Repository<Order>(), spec, specParams.PageIndex, specParams.PageSize, o => o.ToDto());
        }

        [HttpGet("orders/{id:int}")]
        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            var spec = new OrderSpecification(id);
            var order = await units.Repository<Order>().GetEntityWithSpec(spec);

            if (order == null) return BadRequest("No order with that ID");

            return order.ToDto();
        }

        [HttpPost("orders/refund/{id:int}")]
        public async Task<ActionResult<OrderDto>> RefundOrder(int id)
        {
            var spec = new OrderSpecification(id);

            var order = await units.Repository<Order>().GetEntityWithSpec(spec);
            if (order == null) return BadRequest("No order with that id");

            if(order.Status == OrderStatus.Pending)
            {
                return BadRequest("Payment not received for this order");
            }

            var result = await paymentService.RefundPayment(order.PaymentIntentId);

            if(result == "succeeded")
            {
                order.Status = OrderStatus.Refunded;

                await units.Complete();

                return order.ToDto();
            }

            return BadRequest("Problem in refunding order");
        }
    }
}
