// script.js - DankFlow Socials Final Universal Logic (Prompt-Free Version)

const prices = {
    'TikTok': { 
        '1k Likes': [20, 35, 55, 70, 90], 
        '5k Likes': [90, 170, 250, 340, 430],
        'tk-shares': [5, 8, 11, 14, 17],
        'tk-views': [7, 9, 11, 13, 15]
    },
    'Facebook': { 
        'fb-likes': [10, 15, 25, 35, 45],
        'fb-views': [7, 9, 11, 13, 15],
        'fb-shares': [20, 35, 55, 70, 90]
    },
    'Instagram': { 
        'ig-likes': { '1k Likes': [10, 15, 25, 35, 45], '2k Likes': [7, 9, 12, 15, 18], '5k Likes': [9, 15, 23, 28, 33] },
        'ig-views': { '1k Views': [5, 10, 12, 15, 18], '2k Views': [8, 12, 15, 18, 20], '5k Views': [10, 15, 20, 25, 30] }
    }
};

let currentConfig = { package: '1k Likes' };
let selectedFollowerPack = { name: '1k Followers', price: 50 }; // Default for tiktok.html
let cart = []; 

/** * 1. THE EVENT SENDER 
 * Sends order data from sub-pages (tabs) to the main index.html
 */
function sendToMainCart(platform, service, price, links) {
    const orderData = {
        type: 'ADD_TO_CART',
        item: { platform, service, price: parseInt(price), links }
    };
    window.parent.postMessage(orderData, '*');
}

/** * 2. FOLLOWER CONFIGURATOR (NEW: No Popups)
 * Handles selecting a package and reading the link from the page input
 */
function setFollowerPackage(name, price, btn) {
    selectedFollowerPack = { name, price };
    const btns = btn.parentElement.querySelectorAll('button');
    btns.forEach(b => b.classList.remove('active-config'));
    btn.classList.add('active-config');
}

function addFollowersDirect(platform) {
    const linkInput = document.getElementById('follower-link');
    if (!linkInput) return;
    
    const link = linkInput.value.trim();
    if (!link || link.length < 3) {
        alert("Please enter a valid link or username in the box provided.");
        return;
    }

    sendToMainCart(platform, selectedFollowerPack.name, selectedFollowerPack.price, link);
    linkInput.value = ""; // Clear for next use
}

/** * 3. LIKES/VIEWS CONFIGURATOR
 */
function setConfig(platform, pack, prefix) {
    currentConfig.package = pack;
    const btns = event.target.parentElement.querySelectorAll('button');
    btns.forEach(b => b.classList.remove('active-config'));
    event.target.classList.add('active-config');
    updatePrice(platform, prefix);
}

function updatePrice(platform, prefix) {
    const input = document.getElementById(`${prefix}-count`);
    if (!input) return;
    let count = Math.min(Math.max(parseInt(input.value) || 1, 1), 5);
    input.value = count;

    let finalPrice = 0;
    if (platform === 'Instagram') {
        finalPrice = prices[platform][prefix][currentConfig.package][count - 1];
    } else if (prefix === 'tk-likes') {
        finalPrice = prices[platform][currentConfig.package][count - 1];
    } else {
        finalPrice = prices[platform][prefix][count - 1];
    }
    
    const display = document.getElementById(`${prefix}-price`);
    if (display) display.innerText = `GHS ${finalPrice}`;
    generateLinks(prefix, count);
}

function generateLinks(prefix, count) {
    const container = document.getElementById(`${prefix}-links`);
    if (!container) return;
    container.innerHTML = `<p class="text-[9px] text-slate-500 uppercase font-black mb-1">Link(s) for ${count} posts:</p>`;
    for (let i = 1; i <= count; i++) {
        container.innerHTML += `<input type="text" autocomplete="off" placeholder="Paste Link ${i}..." class="link-input w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:border-pink-500 outline-none mb-2">`;
    }
}

function validateAndAdd(platform, prefix) {
    const inputs = document.querySelectorAll(`#${prefix}-links .link-input`);
    const links = Array.from(inputs).map(i => i.value.trim()).filter(v => v.length > 3);
    const count = parseInt(document.getElementById(`${prefix}-count`).value);

    if (links.length < count) return alert(`Please provide all ${count} links!`);

    let finalPrice = 0;
    if (platform === 'Instagram') {
        finalPrice = prices[platform][prefix][currentConfig.package][count - 1];
    } else if (prefix === 'tk-likes') {
        finalPrice = prices[platform][currentConfig.package][count - 1];
    } else {
        finalPrice = prices[platform][prefix][count - 1];
    }

    sendToMainCart(platform, `${currentConfig.package} (${count} links)`, finalPrice, links.join('\n'));
}

/** * 4. MAIN PAGE LOGIC (index.html context)
 */
function updateCartUI() {
    const container = document.getElementById('cartItems');
    const badge = document.getElementById('cartBadge');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return; 

    let total = 0;
    container.innerHTML = cart.length === 0 ? '<p class="text-center text-slate-400 py-20 text-[10px] font-bold">YOUR CART IS EMPTY</p>' : '';
    
    cart.forEach((item, i) => {
        total += item.price;
        container.innerHTML += `
            <div class="cart-item p-4 rounded-2xl border border-slate-100 mb-3 bg-slate-50 animate-fadeIn">
                <div class="flex justify-between items-start mb-1 text-[9px] font-black uppercase">
                    <span class="text-pink-600">${item.platform}</span>
                    <button onclick="removeFromCart(${i})" class="text-slate-400 hover:text-red-500">Remove</button>
                </div>
                <p class="text-xs font-bold text-slate-800">${item.service}</p>
                <p class="text-right font-black text-slate-900 mt-2 font-mono">GHS ${item.price}</p>
            </div>`;
    });
    
    if (badge) {
        badge.innerText = cart.length;
        badge.classList.toggle('hidden', cart.length === 0);
    }
    if (totalEl) totalEl.innerText = `GHS ${total}`;
}

function removeFromCart(i) { cart.splice(i, 1); updateCartUI(); }
function toggleCart() { document.getElementById('cartModal').classList.toggle('hidden'); }

function checkoutWhatsApp() {
    if (cart.length === 0) return;
    const orderId = "DF-" + Math.floor(1000 + Math.random() * 9000);
    let total = 0;
    let itemsBody = "";
    
    cart.forEach((item, index) => {
        total += item.price;
        itemsBody += `${index + 1}. *${item.platform} ${item.service}*\n🔗 Link:\n${item.links}\n💰 GHS ${item.price}\n\n`;
    });

    const msg = `🚀 *NEW ORDER: ${orderId}*\n\n${itemsBody}*TOTAL: GHS ${total}*\n\n_I am ready to pay. Please send MoMo details._`;
    window.open(`https://wa.me/233547592041?text=${encodeURIComponent(msg)}`, '_blank');
    cart = []; updateCartUI(); toggleCart();
}

function sendMassOrder() {
    const p = document.getElementById('mass-platform').value;
    const s = document.getElementById('mass-service').value;
    const q = document.getElementById('mass-quantity').value;
    const l = document.getElementById('mass-links').value;
    if (!s || !q || !l) return alert("Fill all fields!");
    const msg = `🔥 *MASS ORDER REQUEST*\nPlatform: ${p}\nService: ${s}\nQty: ${q}\nLinks:\n${l}\n\n_Custom quote please._`;
    window.open(`https://wa.me/233547592041?text=${encodeURIComponent(msg)}`, '_blank');
}