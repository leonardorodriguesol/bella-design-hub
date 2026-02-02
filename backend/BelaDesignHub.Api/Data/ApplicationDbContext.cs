using BelaDesignHub.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BelaDesignHub.Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Expense> Expenses => Set<Expense>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>(builder =>
        {
            builder.ToTable("customers");
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(150);
            builder.Property(c => c.Email)
                   .HasMaxLength(150);
            builder.Property(c => c.Phone)
                   .HasMaxLength(40);
            builder.Property(c => c.CreatedAt)
                   .IsRequired();
        });

        modelBuilder.Entity<Order>(builder =>
        {
            builder.ToTable("orders");
            builder.HasKey(o => o.Id);
            builder.Property(o => o.Code)
                   .IsRequired()
                   .HasMaxLength(30);
            builder.Property(o => o.TotalAmount)
                   .HasColumnType("numeric(14,2)");
            builder.HasOne(o => o.Customer)
                   .WithMany()
                   .HasForeignKey(o => o.CustomerId)
                   .OnDelete(DeleteBehavior.Restrict);
            builder.Property(o => o.Status)
                   .HasConversion<int>();
        });

        modelBuilder.Entity<OrderItem>(builder =>
        {
            builder.ToTable("order_items");
            builder.HasKey(oi => oi.Id);
            builder.Property(oi => oi.Description)
                   .IsRequired()
                   .HasMaxLength(250);
            builder.Property(oi => oi.UnitPrice)
                   .HasColumnType("numeric(14,2)");
            builder.Property(oi => oi.Quantity)
                   .IsRequired();
            builder.HasOne(oi => oi.Order)
                   .WithMany(o => o.Items)
                   .HasForeignKey(oi => oi.OrderId)
                   .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Expense>(builder =>
        {
            builder.ToTable("expenses");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Description)
                   .IsRequired()
                   .HasMaxLength(200);
            builder.Property(e => e.Amount)
                   .HasColumnType("numeric(14,2)")
                   .IsRequired();
            builder.Property(e => e.Category)
                   .HasConversion<int>();
            builder.Property(e => e.ExpenseDate)
                   .IsRequired();
        });
    }
}
