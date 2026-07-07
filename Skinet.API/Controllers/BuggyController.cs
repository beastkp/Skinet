using Microsoft.AspNetCore.Mvc;
using Skinet.API.DTOs;
using Skinet.Core.Entities;

namespace Skinet.API.Controllers
{
    public class BuggyController : BaseApiController
    {
        [HttpGet("unauthorized")]
        public IActionResult GetUnAuthorized()
        {
            return Unauthorized();
        }

        [HttpGet("badRequest")]
        public IActionResult GetBadRequest()
        {
            return BadRequest("Not a good request");
        }

        [HttpGet("notfound")]
        public IActionResult GetNotFound()
        {
            return NotFound();
        }

        [HttpGet("internalError")]
        public IActionResult GetInternalError()
        {
            throw new Exception("This is a test exception for a new exception");
        }

        [HttpPost("validationError")]
        public IActionResult GetValidationError(CreateProductDto product)
        {
            return Ok();
        }
    }

}
