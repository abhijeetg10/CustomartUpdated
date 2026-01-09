
// ===== IMPROVED THREE.JS 3D PREVIEW =====
const canvas = document.getElementById('preview3D');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1220);

const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Enhanced Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
dir1.position.set(5, 10, 8);
scene.add(dir1);
const dir2 = new THREE.DirectionalLight(0xffffff, 0.4);
dir2.position.set(-5, 5, -5);
scene.add(dir2);

let productGroup = new THREE.Group();
scene.add(productGroup);

let productMesh, designMesh, handleMesh;
let currentProduct = 'mug';

function createProduct(type) {
  productGroup.clear();
  productGroup.rotation.set(0, 0, 0);

  const edgeMat = new THREE.LineBasicMaterial({ color: 0xE3B341, transparent: true, opacity: 0.2 });

  if (type === 'mousepad') {
    const width = 3.5, height = 2.2, radius = 0.2;
    const shape = new THREE.Shape();
    shape.moveTo(-width/2 + radius, -height/2);
    shape.lineTo(width/2 - radius, -height/2);
    shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + radius);
    shape.lineTo(width/2, height/2 - radius);
    shape.quadraticCurveTo(width/2, height/2, width/2 - radius, height/2);
    shape.lineTo(-width/2 + radius, height/2);
    shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - radius);
    shape.lineTo(-width/2, -height/2 + radius);
    shape.quadraticCurveTo(-width/2, -height/2, -width/2 + radius, -height/2);

    const extrudeSettings = { depth: 0.02, bevelEnabled: false };
    const bodyGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
    productMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    productGroup.add(productMesh);

    const designMargin = 0.06;
    const designShape = new THREE.Shape();
    const dw = width - designMargin, dh = height - designMargin, dr = radius - (designMargin/2);
    designShape.moveTo(-dw/2 + dr, -dh/2);
    designShape.lineTo(dw/2 - dr, -dh/2);
    designShape.quadraticCurveTo(dw/2, -dh/2, dw/2, -dh/2 + dr);
    designShape.lineTo(dw/2, dh/2 - dr);
    designShape.quadraticCurveTo(dw/2, dh/2, dw/2 - dr, dh/2);
    designShape.lineTo(-dw/2 + dr, dh/2);
    designShape.quadraticCurveTo(-dw/2, dh/2, -dw/2, dh/2 - dr);
    designShape.lineTo(-dw/2, -dh/2 + dr);
    designShape.quadraticCurveTo(-dw/2, -dh/2, -dw/2 + dr, -dh/2);

    const designGeo = new THREE.ShapeGeometry(designShape);
    const uvAttribute = designGeo.attributes.uv;
    for (let i = 0; i < uvAttribute.count; i++) {
      let u = uvAttribute.getX(i);
      let v = uvAttribute.getY(i);
      uvAttribute.setXY(i, (u + dw/2) / dw, (v + dh/2) / dh);
    }

    designMesh = new THREE.Mesh(designGeo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, alphaTest: 0.05, side: THREE.DoubleSide }));
    designMesh.position.z = 0.021; 
    productMesh.add(designMesh);

    camera.position.set(0, 0, 4.5);
    camera.lookAt(0, 0, 0);

  } else {
    // ===== NEW REALISTIC MUG DESIGN =====
    
    // 1. MUG BODY (Cylindrical but with a slight hollow look at the top)
    const bodyGeometry = new THREE.CylinderGeometry(0.85, 0.85, 1.8, 64);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      roughness: 0.2,
      metalness: 0.1
    });
    productMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    productGroup.add(productMesh);

    // 2. MUG TOP RIM (Makes it look hollow)
    const rimGeo = new THREE.TorusGeometry(0.81, 0.04, 16, 100);
    const rim = new THREE.Mesh(rimGeo, bodyMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.9;
    productMesh.add(rim);

    // 3. THE HANDLE (Torus shape attached to the side)
    const handleCurve = new THREE.TorusGeometry(0.4, 0.08, 16, 100, Math.PI * 1.2);
    handleMesh = new THREE.Mesh(handleCurve, bodyMaterial);
    
    // Position the handle to touch the cylinder
    handleMesh.position.set(0.8, 0, 0);
    handleMesh.rotation.z = -Math.PI / 1.1; // Rotates handle to a natural angle
    productMesh.add(handleMesh);

    // 4. PRINTING AREA (Restricted to Mug Height with small margins)
    const designGeometry = new THREE.CylinderGeometry(0.86, 0.86, 1.6, 64, 1, true);
    const designMat = new THREE.MeshBasicMaterial({ 
      transparent: true, 
      side: THREE.DoubleSide, 
      depthWrite: false, 
      alphaTest: 0.05 
    });
    designMesh = new THREE.Mesh(designGeometry, designMat);
    productMesh.add(designMesh);

    camera.position.set(0, 0.3, 4.5);
    camera.lookAt(0, 0, 0);
  }
}  


createProduct(currentProduct);

// ===== FILE UPLOAD LISTENER (STUDIO) =====
const studioFileInput = document.getElementById('studioFile');
if (studioFileInput) {
  studioFileInput.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const tex = new THREE.TextureLoader().load(reader.result);
         
        // PREVENT REPEATING / BLEEDING
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.minFilter = THREE.LinearFilter;
        
        if (designMesh) {
          designMesh.material.map = tex;
          designMesh.material.transparent = true;
          designMesh.material.needsUpdate = true;
          updateDesign(); // Refresh boundaries
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });
}

// Design controls
const scaleRange = document.getElementById('scaleRange');
const posX = document.getElementById('posX');
const posY = document.getElementById('posY');

function updateDesign() {
  if (!designMesh || !designMesh.material.map) return;

  const s = 1 / parseFloat(scaleRange.value); 
  const texture = designMesh.material.map;

  texture.center.set(0.5, 0.5);
  texture.repeat.set(s, s);

  // Normal orientation offsets
  texture.offset.x = -parseFloat(posX.value);
  texture.offset.y = -parseFloat(posY.value);

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
}

[scaleRange, posX, posY].forEach(el => el.addEventListener('input', updateDesign));

// Product switch
const productSelect = document.getElementById('productSelect');
productSelect.addEventListener('change', e => {
  currentProduct = e.target.value;
  createProduct(currentProduct);
  scaleRange.value = 0.8;
  posX.value = 0;
  posY.value = 0;
});

// Interaction and Render logic
let dragging = false;
let lastX = 0, lastY = 0;
canvas.addEventListener('mousedown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
window.addEventListener('mouseup', () => dragging = false);
canvas.addEventListener('mousemove', e => {
  if(!dragging) return;
  productGroup.rotation.y += (e.clientX - lastX) * 0.008;
  productGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, productGroup.rotation.x + (e.clientY - lastY) * 0.008));
  lastX = e.clientX; lastY = e.clientY;
});

function animate(){ requestAnimationFrame(animate); renderer.render(scene, camera); }
animate();

window.addEventListener('resize', () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
});

// ===== UI LOGIC (HERO, MODALS, GALLERY) =====
const slides = document.querySelectorAll('.hero-slideshow .slide');
let currentSlide = 0;
setInterval(() => {
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active');
}, 3000);

function openOrderModal(){ document.getElementById("orderModal").style.display = "flex"; }
function closeOrderModal(){ document.getElementById("orderModal").style.display = "none"; }
function closeModal(){ document.getElementById('contactModal').style.display = 'none'; }

const priceMap = { mug:199, mousepad:199, cap:199, tshirt:499 };
const orderProduct = document.getElementById("orderProductSelect");
const orderQty = document.getElementById("orderQuantity");
const orderPrice = document.getElementById("orderTotalPrice");

function updatePrice(){ orderPrice.textContent = priceMap[orderProduct.value] * orderQty.value; }
orderProduct.addEventListener("change", updatePrice);
orderQty.addEventListener("input", updatePrice);

// Gallery Filter
document.querySelectorAll('.gallery-filters .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gallery-filters .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.style.display = (filter === 'all' || item.classList.contains(filter)) ? 'block' : 'none';
    });
  });
});

// Payment & Database Submission
const paymentSelect = document.getElementById("paymentMethod");
const qrBox = document.getElementById("upiQRBox");
const qrImg = document.getElementById("upiQR");
const isDesktop = () => !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

paymentSelect.addEventListener("change", () => {
  if(paymentSelect.value === "upi" && isDesktop()){
    const total = priceMap[orderProduct.value] * orderQty.value;
    const upiString = `upi://pay?pa=patilonkar440@okicici&pn=CustomArt&am=${total}&cu=INR`;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`;
    qrBox.style.display = "block";
  } else { qrBox.style.display = "none"; }
});

document.getElementById("orderForm").addEventListener("submit", e => {
  e.preventDefault();
  
  // 1. Collect Form Data
  const name = document.getElementById("custName").value;
  const mobile = document.getElementById("custMobile").value;
  const address = document.getElementById("custAddress").value;
  const product = orderProduct.value;
  const qty = orderQty.value;
  const total = document.getElementById("orderTotalPrice").textContent;
  const payment = document.getElementById("paymentMethod").value;

  // 2. Format the WhatsApp Message
  // Using %0A for new lines and * for bold text
  const message = 
    `*🚀 NEW ORDER RECEIVED - CustomArt*%0A%0A` +
    `*👤 Customer:* ${name}%0A` +
    `*📞 Contact:* ${mobile}%0A` +
    `*📍 Address:* ${address}%0A%0A` +
    `*📦 Product:* ${product}%0A` +
    `*🔢 Quantity:* ${qty}%0A` +
    `*💰 Total Amount:* ₹${total}%0A` +
    `*💳 Payment:* ${payment.toUpperCase()}%0A%0A` +
    `_Please send your design image here after this message._`;

  // 3. Open WhatsApp
  const whatsappNumber = "918830524454";
  const url = `https://wa.me/${whatsappNumber}?text=${message}`;
  
  window.open(url, "_blank");

  // 4. Cleanup UI
  alert("Redirecting to WhatsApp to complete your order...");
  closeOrderModal();
  document.getElementById("orderForm").reset();
});

window.addEventListener('load', () => {
  const loader = document.getElementById('preloader');
  setTimeout(() => {
    loader.classList.add('fade-out');
  }, 500); // Small delay for a smooth transition
});
