using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skinet.Core.Entities;

namespace Skinet.Core.Interfaces
{
    public interface IGenericRepository<T> where T : BaseEntity
    {
        Task<T?> GetByIdAsync(int id);
        Task<IReadOnlyList<T>> ListAllAsync();
        Task<T?> GetEntityWithSpec(ISpecification<T> spec);
        Task<IReadOnlyList<T>> ListAsync(ISpecification<T> spec);
        Task<TResult?> GetEntityWithSpec<TResult>(ISpecification<T, TResult> spec);
        Task<IReadOnlyList<TResult>> ListAsync<TResult>(ISpecification<T, TResult> spec);
        void Add(T entity);
        void Update(T entity);
        void Remove(T entity);
        bool Exists(int id);
        Task<int> CountAsync(ISpecification<T> spec); 
        // when we use pagination, we make 2 requests to our database, one ot get list of products and one to get count of products
        // this is unavoidable with this system (specification pattern)

    }
}

// the generic repository pattern provides a generic expression(Expression<Func<T, bool>> query) for performing very specific operations,
// but here for this generic expression we are returning an Iqueryable(potentially exposing the ddataset) which is wrong (leaky abstraction)
// The solution can be to create other services that are built on top of repositories for specific functionalities but that will just bloat the codebase 
// Specification pattern comes to the rescue here.

