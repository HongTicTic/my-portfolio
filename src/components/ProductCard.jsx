const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
      <h3 className="text-gray-900 font-semibold">{product.name}</h3>
      <p className="text-gray-700">${product.price.toFixed(2)}</p>
      <span
        className={`inline-block w-fit px-2 py-1 rounded-full text-xs font-semibold text-white ${
          product.inStock ? 'bg-green-600' : 'bg-gray-500'
        }`}
      >
        {product.inStock ? 'In stock' : 'Sold out'}
      </span>
    </div>
  );
};

export default ProductCard;