using BelaDesignHub.Application.Models.Requests;
using BelaDesignHub.Domain.Entities;
using BelaDesignHub.Infrastructure.Persistence.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BelaDesignHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceOrdersController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceOrder>>> GetServiceOrders(
        [FromQuery] Guid? customerId,
        [FromQuery] Guid? orderId,
        [FromQuery] ServiceOrderStatus? status,
        [FromQuery] DateOnly? scheduledFrom,
        [FromQuery] DateOnly? scheduledTo,
        CancellationToken cancellationToken)
    {
        var query = _context.ServiceOrders
            .AsNoTracking()
            .Include(so => so.Items)
            .Include(so => so.Order)
                .ThenInclude(o => o!.Items)
            .Include(so => so.Customer)
            .AsQueryable();

        if (customerId.HasValue)
        {
            query = query.Where(so => so.CustomerId == customerId.Value);
        }

        if (orderId.HasValue)
        {
            query = query.Where(so => so.OrderId == orderId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(so => so.Status == status.Value);
        }

        if (scheduledFrom.HasValue)
        {
            query = query.Where(so => so.ScheduledDate >= scheduledFrom.Value);
        }

        if (scheduledTo.HasValue)
        {
            query = query.Where(so => so.ScheduledDate <= scheduledTo.Value);
        }

        var orders = await query
            .OrderBy(so => so.ScheduledDate)
            .ThenBy(so => so.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ServiceOrder>> GetServiceOrderById(Guid id, CancellationToken cancellationToken)
    {
        var serviceOrder = await _context.ServiceOrders
            .AsNoTracking()
            .Include(so => so.Items)
            .Include(so => so.Order)!
                .ThenInclude(o => o.Items)
            .Include(so => so.Customer)
            .FirstOrDefaultAsync(so => so.Id == id, cancellationToken);

        if (serviceOrder is null)
        {
            return NotFound();
        }

        return Ok(serviceOrder);
    }

    [HttpPost]
    public async Task<ActionResult<ServiceOrder>> CreateServiceOrder(
        [FromBody] CreateServiceOrderRequest request,
        CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order is null)
        {
            return BadRequest("Pedido não encontrado.");
        }

        if (order.CustomerId != request.CustomerId)
        {
            return BadRequest("O cliente informado não corresponde ao pedido.");
        }

        var customerExists = await _context.Customers.AnyAsync(c => c.Id == request.CustomerId, cancellationToken);
        if (!customerExists)
        {
            return BadRequest("Cliente não encontrado.");
        }

        if (!TryBuildServiceOrderItems(order, request.Items, out var items))
        {
            return BadRequest("Um ou mais itens informados não pertencem ao pedido.");
        }

        var serviceOrder = new ServiceOrder
        {
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            ScheduledDate = request.ScheduledDate,
            Responsible = request.Responsible,
            Notes = request.Notes,
            Status = ServiceOrderStatus.Scheduled,
            Items = items,
        };

        await _context.ServiceOrders.AddAsync(serviceOrder, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetServiceOrderById), new { id = serviceOrder.Id }, serviceOrder);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ServiceOrder>> UpdateServiceOrder(
        Guid id,
        [FromBody] CreateServiceOrderRequest request,
        CancellationToken cancellationToken)
    {
        var serviceOrder = await _context.ServiceOrders
            .Include(so => so.Items)
            .FirstOrDefaultAsync(so => so.Id == id, cancellationToken);

        if (serviceOrder is null)
        {
            return NotFound();
        }

        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order is null)
        {
            return BadRequest("Pedido não encontrado.");
        }

        if (order.CustomerId != request.CustomerId)
        {
            return BadRequest("O cliente informado não corresponde ao pedido.");
        }

        var customerExists = await _context.Customers.AnyAsync(c => c.Id == request.CustomerId, cancellationToken);
        if (!customerExists)
        {
            return BadRequest("Cliente não encontrado.");
        }

        if (!TryBuildServiceOrderItems(order, request.Items, out var items))
        {
            return BadRequest("Um ou mais itens informados não pertencem ao pedido.");
        }

        _context.ServiceOrderItems.RemoveRange(serviceOrder.Items);

        serviceOrder.OrderId = order.Id;
        serviceOrder.CustomerId = order.CustomerId;
        serviceOrder.ScheduledDate = request.ScheduledDate;
        serviceOrder.Responsible = request.Responsible;
        serviceOrder.Notes = request.Notes;
        serviceOrder.UpdatedAt = DateTime.UtcNow;
        serviceOrder.Items = items;

        await _context.ServiceOrderItems.AddRangeAsync(items, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(serviceOrder);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteServiceOrder(Guid id, CancellationToken cancellationToken)
    {
        var serviceOrder = await _context.ServiceOrders.FirstOrDefaultAsync(so => so.Id == id, cancellationToken);

        if (serviceOrder is null)
        {
            return NotFound();
        }

        _context.ServiceOrders.Remove(serviceOrder);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<ServiceOrder>> UpdateServiceOrderStatus(
        Guid id,
        [FromBody] UpdateServiceOrderStatusRequest request,
        CancellationToken cancellationToken)
    {
        var serviceOrder = await _context.ServiceOrders.FirstOrDefaultAsync(so => so.Id == id, cancellationToken);

        if (serviceOrder is null)
        {
            return NotFound();
        }

        serviceOrder.Status = request.Status;
        serviceOrder.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(serviceOrder);
    }

    private static bool TryBuildServiceOrderItems(
        Order order,
        List<ServiceOrderItemRequest>? requestItems,
        out List<ServiceOrderItem> items)
    {
        var orderItemsById = order.Items.ToDictionary(item => item.Id);
        var incomingItems = requestItems ?? [];
        var requestedLinkedItems = incomingItems.Where(item => item.OrderItemId.HasValue).ToList();

        if (requestedLinkedItems.Any(item => !orderItemsById.ContainsKey(item.OrderItemId!.Value)))
        {
            items = [];
            return false;
        }

        items = [];

        if (requestedLinkedItems.Count > 0)
        {
            items.AddRange(requestedLinkedItems.Select(item =>
            {
                var sourceItem = orderItemsById[item.OrderItemId!.Value];
                return new ServiceOrderItem
                {
                    OrderItemId = item.OrderItemId,
                    Description = string.IsNullOrWhiteSpace(item.Description) ? sourceItem.Description : item.Description.Trim(),
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                };
            }));
        }
        else
        {
            items.AddRange(order.Items.Select(item => new ServiceOrderItem
            {
                OrderItemId = item.Id,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
            }));
        }

        items.AddRange(incomingItems
            .Where(item => !item.OrderItemId.HasValue)
            .Select(item => new ServiceOrderItem
            {
                Description = item.Description.Trim(),
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
            }));

        return true;
    }
}
