function createSquares() {
    const grid = document.getElementById('grid');
    console.log('Creating squares for grid:', grid);
    grid.innerHTML = '';
    
    // Load existing purchases
    const purchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');

    for (let i = 1; i <= 200; i++) {
        const square = document.createElement('div');
        square.className = 'square';
        
        // Check if square is already purchased and active
        if (purchases[i] && purchases[i].status === 'active') {
            const endDate = new Date(purchases[i].endDate);
            const today = new Date();
            
            // Check if ad is still active
            if (today < endDate) {
                square.innerHTML = `
                    <img src="${purchases[i].logoData}" style="max-width: 80%; max-height: 80%; border-radius: 5px;">
                `;
                square.style.cursor = 'pointer';
                square.title = `${purchases[i].businessName}\n${purchases[i].adText}\nDeal: ${purchases[i].dealLink}\nExpires: ${endDate.toLocaleDateString()}`;
                
                // Add click to open deal link
                square.addEventListener('click', function() {
                    window.open(purchases[i].dealLink, '_blank');
                });
            } else {
                // Ad expired - show as available with proper styling
                createAvailableSquare(square, i);
            }
        } else {
            // Available square with proper styling
            createAvailableSquare(square, i);
        }
        
        grid.appendChild(square);
    }
    console.log('200 squares created!');
}

function createAvailableSquare(square, number) {
    square.innerHTML = `
        <div class="square-text">BUY THIS SQUARE</div>
        <div class="square-price">£1/DAY</div>
        <div class="square-number">#${number}</div>
    `;
    square.addEventListener('click', function() {
        window.location.href = `purchase.html?square=${number}`;
    });
}

// Create squares when page loads
window.addEventListener('load', createSquares);