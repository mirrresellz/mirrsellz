// 🔥 FIREBASE (REPLACE THIS)
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// NAVIGATION
function go(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  setTimeout(()=>document.getElementById(page).classList.add("active"),100);
}

// CART
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(name,price){
  cart.push({name,price});
  saveCart();
  alert("Added to cart");
}

function addCurrent(){
  addToCart(currentProduct,14.99);
}

function loadCart(){
  let box=document.getElementById("cartItems");
  let total=0;
  box.innerHTML="";

  cart=JSON.parse(localStorage.getItem("cart"))||[];

  cart.forEach((item,i)=>{
    total+=item.price;

    box.innerHTML+=`
      <div class="card">
        ${item.name} - $${item.price}
        <br>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;
  });

  document.getElementById("total").innerText="Total: $"+total.toFixed(2);
}

function removeItem(i){
  cart.splice(i,1);
  saveCart();
  loadCart();
}

// 💳 CHECKOUT
const STRIPE_LINK="https://buy.stripe.com/XXXXX";

async function checkout(){
  await db.collection("orders").add({
    cart,
    time:Date.now(),
    user:navigator.userAgent
  });

  window.location.href=STRIPE_LINK;
}

// PRODUCTS
let currentProduct="";
let rating=0;

function openProduct(p){
  currentProduct=p;
  document.getElementById("productTitle").innerText=p;

  loadReviews();
  go("product");
}

// ⭐ REVIEWS
function setRating(r){rating=r;}

async function submitReview(){
  let text=document.getElementById("reviewText").value;

  if(!rating)return alert("Pick rating");

  await db.collection("reviews").add({
    product:currentProduct,
    rating,
    text,
    time:Date.now(),
    user:navigator.userAgent
  });

  document.getElementById("reviewText").value="";
  rating=0;

  loadReviews();
}

async function loadReviews(){
  let list=document.getElementById("reviews");
  list.innerHTML="Loading...";

  let snap=await db.collection("reviews")
    .where("product","==",currentProduct)
    .orderBy("time","desc")
    .get();

  list.innerHTML="";

  if(snap.empty){
    list.innerHTML="No reviews yet";
    return;
  }

  snap.forEach(doc=>{
    let r=doc.data();

    list.innerHTML+=`
      <div class="review">
        ${"⭐".repeat(r.rating)}
        <br>${r.text}
      </div>
    `;
  });
}