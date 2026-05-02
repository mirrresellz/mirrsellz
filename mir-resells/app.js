// =========================
// 🔥 FIREBASE SETUP
// =========================
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// =========================
// 🛒 CART SYSTEM
// =========================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(name, price){
  cart.push({ name, price });
  saveCart();
  alert("Added to cart");
}

function removeFromCart(index){
  cart.splice(index, 1);
  saveCart();
  loadCart();
}

function clearCart(){
  cart = [];
  saveCart();
  loadCart();
}

function loadCart(){
  let box = document.getElementById("cartItems");
  let totalBox = document.getElementById("total");

  if (!box || !totalBox) return;

  cart = JSON.parse(localStorage.getItem("cart")) || [];
  box.innerHTML = "";

  let total = 0;

  cart.forEach((item, i)=>{
    total += item.price;

    let div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      ${item.name} - $${item.price.toFixed(2)}
      <br>
      <button onclick="removeFromCart(${i})">Remove</button>
    `;
    box.appendChild(div);
  });

  totalBox.innerText = "Total: $" + total.toFixed(2);
}

// =========================
// 💳 CHECKOUT
// =========================
const STRIPE_LINK = "https://buy.stripe.com/XXXXX";

async function checkout(){
  try {
    if(cart.length === 0){
      alert("Cart is empty");
      return;
    }

    // Save order
    await db.collection("orders").add({
      cart: cart,
      total: cart.reduce((t, i)=>t+i.price, 0),
      time: Date.now(),
      user: navigator.userAgent
    });

    // Redirect to Stripe
    window.location.href = STRIPE_LINK;

  } catch(err){
    console.error(err);
    alert("Checkout error. Try again.");
  }
}

// =========================
// ⭐ REVIEWS SYSTEM
// =========================
let rating = 0;

function setRating(r){
  rating = r;
  console.log("Rating set:", r);
}

async function submitReview(product){
  try {
    let textBox = document.getElementById("reviewText");
    if (!textBox) return;

    let text = textBox.value.trim();

    if (!rating){
      alert("Select a rating");
      return;
    }

    if (!text){
      alert("Write a review");
      return;
    }

    await db.collection("reviews").add({
      product: product,
      rating: rating,
      text: text,
      time: Date.now(),
      user: navigator.userAgent
    });

    textBox.value = "";
    rating = 0;

    loadReviews(product);

  } catch(err){
    console.error(err);
    alert("Error submitting review");
  }
}

async function loadReviews(product){
  try {
    let list = document.getElementById("reviews");
    if (!list) return;

    list.innerHTML = "Loading...";

    let snap = await db.collection("reviews")
      .where("product","==",product)
      .orderBy("time","desc")
      .get();

    list.innerHTML = "";

    if (snap.empty){
      list.innerHTML = "<p>No reviews yet</p>";
      return;
    }

    snap.forEach(doc=>{
      let r = doc.data();

      let div = document.createElement("div");
      div.className = "review";

      div.innerHTML = `
        ${"⭐".repeat(r.rating)}
        <br>${escapeHTML(r.text)}
        <br><small>${new Date(r.time).toLocaleString()}</small>
        <hr>
      `;

      list.appendChild(div);
    });

  } catch(err){
    console.error(err);
    document.getElementById("reviews").innerHTML = "Error loading reviews";
  }
}

// =========================
// 🔒 SECURITY HELPERS
// =========================
function escapeHTML(str){
  return str.replace(/[&<>"']/g, function(m){
    return ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    })[m];
  });
}

// =========================
// 🚀 INIT (AUTO RUN)
// =========================
window.addEventListener("DOMContentLoaded", ()=>{
  if(document.getElementById("cartItems")){
    loadCart();
  }
});