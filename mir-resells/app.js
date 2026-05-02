// app.js

// CART
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(name, price){
  cart.push({name, price});
  saveCart();
  alert("Added to cart");
}

function loadCart(){
  let box = document.getElementById("cartItems");
  let totalBox = document.getElementById("total");

  if(!box) return;

  cart = JSON.parse(localStorage.getItem("cart")) || [];
  box.innerHTML = "";

  let total = 0;

  cart.forEach((item,i)=>{
    total += item.price;

    box.innerHTML += `
      <div class="card">
        ${item.name} - $${item.price}
        <br>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });

  if(totalBox){
    totalBox.innerText = "Total: $" + total.toFixed(2);
  }
}

function removeItem(i){
  cart.splice(i,1);
  saveCart();
  loadCart();
}

// CHECKOUT
async function checkout(){
  if(cart.length === 0){
    alert("Cart is empty");
    return;
  }

  await db.collection("orders").add({
    cart,
    time: Date.now(),
    user: navigator.userAgent
  });

  window.location.href = "https://buy.stripe.com/XXXXX";
}

// REVIEWS
let rating = 0;

function setRating(r){
  rating = r;
}

async function submitReview(product){
  let text = document.getElementById("reviewText").value;

  if(!rating) return alert("Pick rating");
  if(!text) return alert("Write review");

  await db.collection("reviews").add({
    product,
    rating,
    text,
    time: Date.now(),
    user: navigator.userAgent
  });

  document.getElementById("reviewText").value="";
  rating = 0;

  loadReviews(product);
}

async function loadReviews(product){
  let list = document.getElementById("reviews");
  if(!list) return;

  list.innerHTML = "Loading...";

  let snap = await db.collection("reviews")
    .where("product","==",product)
    .orderBy("time","desc")
    .get();

  list.innerHTML = "";

  if(snap.empty){
    list.innerHTML = "No reviews yet";
    return;
  }

  snap.forEach(doc=>{
    let r = doc.data();

    list.innerHTML += `
      <div class="review">
        ${"⭐".repeat(r.rating)}
        <br>${r.text}
        <hr>
      </div>
    `;
  });
}