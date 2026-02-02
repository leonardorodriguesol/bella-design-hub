using BelaDesignHub.Api.Data;
using BelaDesignHub.Api.Domain.Entities;
using BelaDesignHub.Api.Models.Requests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BelaDesignHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController(ApplicationDbContext context) : ControllerBase
{
    private readonly ApplicationDbContext _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] ExpenseCategory? category,
        CancellationToken cancellationToken)
    {
        var query = _context.Expenses.AsNoTracking().AsQueryable();

        if (startDate.HasValue)
        {
            query = query.Where(e => e.ExpenseDate >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(e => e.ExpenseDate <= endDate.Value);
        }

        if (category.HasValue)
        {
            query = query.Where(e => e.Category == category.Value);
        }

        var expenses = await query
            .OrderByDescending(e => e.ExpenseDate)
            .ToListAsync(cancellationToken);

        return Ok(expenses);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Expense>> GetExpenseById(Guid id, CancellationToken cancellationToken)
    {
        var expense = await _context.Expenses
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        if (expense is null)
        {
            return NotFound();
        }

        return Ok(expense);
    }

    [HttpPost]
    public async Task<ActionResult<Expense>> CreateExpense([FromBody] CreateExpenseRequest request, CancellationToken cancellationToken)
    {
        var expense = new Expense
        {
            Description = request.Description,
            Amount = request.Amount,
            Category = request.Category,
            ExpenseDate = request.ExpenseDate,
            Notes = request.Notes
        };

        await _context.Expenses.AddAsync(expense, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetExpenseById), new { id = expense.Id }, expense);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Expense>> UpdateExpense(Guid id, [FromBody] UpdateExpenseRequest request, CancellationToken cancellationToken)
    {
        var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        if (expense is null)
        {
            return NotFound();
        }

        expense.Description = request.Description;
        expense.Amount = request.Amount;
        expense.Category = request.Category;
        expense.ExpenseDate = request.ExpenseDate;
        expense.Notes = request.Notes;
        expense.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Ok(expense);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteExpense(Guid id, CancellationToken cancellationToken)
    {
        var expense = await _context.Expenses.FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

        if (expense is null)
        {
            return NotFound();
        }

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
