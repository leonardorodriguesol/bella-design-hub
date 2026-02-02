namespace BelaDesignHub.Api.Domain.Entities;

public enum ExpenseCategory
{
    Materials = 0,
    Labor = 1,
    Logistics = 2,
    Utilities = 3,
    Other = 99
}

public class Expense
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public ExpenseCategory Category { get; set; } = ExpenseCategory.Other;
    public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
