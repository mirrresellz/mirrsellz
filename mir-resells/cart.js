let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price){
  cart.push({name, price});
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(name + " added to cart 🛒");
}

function removeItem(i){
  cart.splice(i,1);
  localStorage.setItem("cart", JSON.stringify(cart));
  location.reload();
}

function getCart(){
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function clearCart(){
  localStorage.removeItem("cart");
  location.reload();
}