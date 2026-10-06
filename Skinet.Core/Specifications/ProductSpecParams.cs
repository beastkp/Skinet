using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Skinet.Core.Specifications
{
    public class ProductSpecParams : PagingParams
    {
        private List<string> _brands = [];
        public List<string> Brands
        {
            get => _brands; //types=boards,gloves
            set
            {
                _brands = value.SelectMany(x => x.Split(',' , StringSplitOptions.RemoveEmptyEntries)).ToList();
            }
        }

        private List<string> _types = [];
        public List<string> Types
        {
            get => _types; //types=boards,gloves
            set
            {
                _types = value.SelectMany(x => x.Split(',', StringSplitOptions.RemoveEmptyEntries)).ToList();
            }
        }

        public string? sort { get; set; }

        private string? _search;

        public string Search
        {
            get { return _search ?? ""; }
            set { _search = value.ToLower(); }
        }

    }
}
