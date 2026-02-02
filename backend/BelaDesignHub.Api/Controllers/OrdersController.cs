using BelaDesignHub.Api.Data;
using BelaDesignHub.Api.Domain.Entities;
using BelaDesignHub.Api.Models.Requests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BelaDesignHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders(
        [FromQuery] Guid? customerId,
        [FromQuery] OrderStatus? status,
        [FromQuery] DateTime? createdFrom,
        [FromQuery] DateTime? createdTo,
        CancellationToken cancellationToken)
    {
        var query = _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .AsQueryable();

        if (customerId.HasValue)
        {
            query = query.Where(o => o.CustomerId == customerId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        if (createdFrom.HasValue)
        {
            query = query.Where(o => o.CreatedAt >= createdFrom.Value);
        }

        if (createdTo.HasValue)
        {
            query = query.Where(o => o.CreatedAt <= createdTo.Value);
        }

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Order>> GetOrderById(Guid id, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (order is null)
        {
            return NotFound();
        }

        return Ok(order);
    }

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var customerExists = await _context.Customers.AnyAsync(c => c.Id == request.CustomerId, cancellationToken);
        if (!customerExists)
        {
            return BadRequest("Cliente não encontrado.");
        }

        var items = request.Items.Select(item => new OrderItem
        {
            Description = item.Description,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice
        }).ToList();

        var order = new Order
        {
            CustomerId = request.CustomerId,
            Code = string.IsNullOrWhiteSpace(request.Code) ? GenerateOrderCode() : request.Code!,
            DeliveryDate = request.DeliveryDate,
            Items = items,
            TotalAmount = items.Sum(i => i.Total)
        };

        await _context.Orders.AddAsync(order, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, order);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Order>> UpdateOrder(Guid id, [FromBody] UpdateOrderRequest request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (order is null)
        {
            return NotFound();
        }

        order.Code = string.IsNullOrWhiteSpace(request.Code) ? order.Code : request.Code!;
        order.Status = request.Status;
        order.DeliveryDate = request.DeliveryDate;
        order.UpdatedAt = DateTime.UtcNow;

        _context.OrderItems.RemoveRange(order.Items);

        var updatedItems = request.Items.Select(item => new OrderItem
        {
            OrderId = order.Id,
            Description = item.Description,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice
        }).ToList();

        order.Items = updatedItems;
        order.TotalAmount = updatedItems.Sum(i => i.Total);

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(order);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteOrder(Guid id, CancellationToken cancellationToken)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (order is null)
        {
            return NotFound();
        }

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private static string GenerateOrderCode() => $"PED-{DateTime.UtcNow:yyyyMMddHHmmss}";
}
