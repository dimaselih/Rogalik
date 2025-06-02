class Game {
    constructor() {
        this.width = 40;
        this.height = 24;
        this.map = [];
        this.player = null;
        this.enemies = [];
        this.items = [];
        this.gameRunning = true;
        this.level = 1; 
        this.score = 0; 
        this.buttonsCreated = false;
        
        this.TILE_TYPES = {
            EMPTY: 0,
            WALL: 1,
            PLAYER: 2,
            ENEMY: 3,
            HEALTH_POTION: 4,
            SWORD: 5
        };
        
        this.initMap();
    }
    
    init() {
        this.generateMap();
        this.placeItems();
        this.placePlayer();
        this.placeEnemies();
        this.render();
        this.bindEvents();
        this.updateUI();
        if (!this.buttonsCreated) {
            this.createButtons();
        }
    }
    
    createButtons() {
        const buttonsHtml = `
            <div id="gameButtons" style="margin-top: 20px;">
                <button id="restartBtn" style="padding: 10px 20px; margin-right: 10px; font-size: 16px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer;">🔄 Перезапуск</button>
                <button id="rulesBtn" style="padding: 10px 20px; font-size: 16px; background: #4444ff; color: white; border: none; border-radius: 5px; cursor: pointer;">📋 Правила</button>
            </div>
        `;
        $('.cl').after(buttonsHtml);
        
        $('#restartBtn').click(() => {
            if (confirm('Вы уверены, что хотите перезапустить игру?')) {
                this.restartGame();
            }
        });
        
        $('#rulesBtn').click(() => {
            this.showRules();
        });
        
        this.buttonsCreated = true;
    }
    
    showRules() {
        const rules = `
🎮 ПРАВИЛА ИГРЫ "РОГАЛИК"

🎯 ЦЕЛЬ:
• Уничтожить всех врагов на уровне
• Набрать максимальное количество очков
• Пройти как можно больше уровней

🕹️ УПРАВЛЕНИЕ:
• W, A, S, D - движение (вверх, влево, вниз, вправо)
• ПРОБЕЛ - атака всех соседних врагов

🎭 ПЕРСОНАЖИ:
• 🟢 Зеленый квадрат - ВЫ (игрок)
• 🔴 Красные квадраты - враги
• 🔵 Синие квадраты - зелья здоровья
• 🟡 Желтые квадраты - мечи

⚔️ БОЕВАЯ СИСТЕМА:
• Атакуйте врагов, находясь рядом с ними
• Враги атакуют вас автоматически при приближении
• Полоски здоровья показывают текущее HP

📈 ПРОГРЕССИЯ:
• С каждым уровнем враги становятся сильнее
• Предметы дают больше бонусов на высоких уровнях
• Ваше максимальное HP увеличивается каждые 3 уровня

🏆 ОЧКИ:
• За каждого врага: 10 × текущий уровень
• За прохождение уровня: 100 × номер уровня

Удачи в подземельях! 🗡️
        `;
        alert(rules);
    }
    
    restartGame() {
        this.level = 1;
        this.score = 0;
        this.gameRunning = true;
        this.enemies = [];
        this.items = [];
        this.player = null;
        this.init();
    }
    
    initMap() {
        this.map = [];
        for (let y = 0; y < this.height; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.map[y][x] = this.TILE_TYPES.WALL;
            }
        }
    }
    
    generateMap() {
        this.initMap();
        
        const rooms = [];
        const roomCount = this.random(5, 10);
        
        for (let i = 0; i < roomCount; i++) {
            let attempts = 0;
            while (attempts < 50) {
                const room = this.generateRoom();
                if (room && !this.roomOverlaps(room, rooms)) {
                    rooms.push(room);
                    this.carveRoom(room);
                    break;
                }
                attempts++;
            }
        }
        
        this.connectRooms(rooms);
        this.generateAdditionalCorridors();
    }
    
    connectRooms(rooms) {
        if (rooms.length < 2) return;
        
        for (let i = 0; i < rooms.length - 1; i++) {
            const roomA = rooms[i];
            const roomB = rooms[i + 1];
            this.createCorridor(roomA, roomB);
        }
        
        const additionalConnections = this.random(1, Math.floor(rooms.length / 2));
        for (let i = 0; i < additionalConnections; i++) {
            const roomA = rooms[this.random(0, rooms.length - 1)];
            const roomB = rooms[this.random(0, rooms.length - 1)];
            if (roomA !== roomB) {
                this.createCorridor(roomA, roomB);
            }
        }
    }
    
    createCorridor(roomA, roomB) {
        const centerA = {
            x: Math.floor(roomA.x + roomA.width / 2),
            y: Math.floor(roomA.y + roomA.height / 2)
        };
        const centerB = {
            x: Math.floor(roomB.x + roomB.width / 2),
            y: Math.floor(roomB.y + roomB.height / 2)
        };
        
        if (Math.random() < 0.5) {
            this.carveHorizontalCorridor(centerA.x, centerB.x, centerA.y);
            this.carveVerticalCorridor(centerA.y, centerB.y, centerB.x);
        } else {
            this.carveVerticalCorridor(centerA.y, centerB.y, centerA.x);
            this.carveHorizontalCorridor(centerA.x, centerB.x, centerB.y);
        }
    }
    
    carveHorizontalCorridor(x1, x2, y) {
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);
        
        for (let x = startX; x <= endX; x++) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                this.map[y][x] = this.TILE_TYPES.EMPTY;
            }
        }
    }
    
    carveVerticalCorridor(y1, y2, x) {
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);
        
        for (let y = startY; y <= endY; y++) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                this.map[y][x] = this.TILE_TYPES.EMPTY;
            }
        }
    }
    
    generateAdditionalCorridors() {
        const additionalCorridors = this.random(2, 4);
        
        for (let i = 0; i < additionalCorridors; i++) {
            if (Math.random() < 0.5) {
                const y = this.random(1, this.height - 2);
                const startX = this.random(1, this.width - 10);
                const length = this.random(5, 15);
                const endX = Math.min(startX + length, this.width - 1);
                
                this.carveHorizontalCorridor(startX, endX, y);
            } else {
                const x = this.random(1, this.width - 2);
                const startY = this.random(1, this.height - 10);
                const length = this.random(5, 15);
                const endY = Math.min(startY + length, this.height - 1);
                
                this.carveVerticalCorridor(startY, endY, x);
            }
        }
    }
    
    generateRoom() {
        const width = this.random(3, 8);
        const height = this.random(3, 8);
        const x = this.random(1, this.width - width - 1);
        const y = this.random(1, this.height - height - 1);
        
        return { x, y, width, height };
    }
    
    roomOverlaps(room, rooms) {
        for (let existingRoom of rooms) {
            if (room.x < existingRoom.x + existingRoom.width + 1 &&
                room.x + room.width + 1 > existingRoom.x &&
                room.y < existingRoom.y + existingRoom.height + 1 &&
                room.y + room.height + 1 > existingRoom.y) {
                return true;
            }
        }
        return false;
    }
    
    carveRoom(room) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                this.map[y][x] = this.TILE_TYPES.EMPTY;
            }
        }
    }
    
    floodFill(x, y, visited) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        if (visited[y][x] || this.map[y][x] === this.TILE_TYPES.WALL) return;
        
        visited[y][x] = true;
        
        this.floodFill(x + 1, y, visited);
        this.floodFill(x - 1, y, visited);
        this.floodFill(x, y + 1, visited);
        this.floodFill(x, y - 1, visited);
    }
    
    placeItems(healthPotionCount = 10, swordCount = 2) {
        this.items = [];
        
        for (let i = 0; i < swordCount; i++) {
            const pos = this.getRandomEmptyPosition();
            if (pos) {
                const swordDamage = 15 + (this.level * 3);
                this.items.push({
                    x: pos.x,
                    y: pos.y,
                    type: 'sword',
                    damage: swordDamage
                });
            }
        }
        
        for (let i = 0; i < healthPotionCount; i++) {
            const pos = this.getRandomEmptyPosition();
            if (pos) {
                const healingAmount = 35 + (this.level * 10);
                this.items.push({
                    x: pos.x,
                    y: pos.y,
                    type: 'health',
                    healing: healingAmount
                });
            }
        }
    }
    
    placePlayer() {
        const pos = this.getRandomEmptyPosition();
        if (pos) {
            this.player = {
                x: pos.x,
                y: pos.y,
                health: 100,
                maxHealth: 100,
                damage: 20
            };
        }
    }
    
    placeEnemies(enemyCount = 10) {
        this.enemies = [];
        for (let i = 0; i < enemyCount; i++) {
            const pos = this.getRandomEmptyPosition();
            if (pos) {
                const baseHealth = 50;
                const baseDamage = 15;
                
                const levelMultiplier = this.level - 1;
                const health = baseHealth + (levelMultiplier * 15);
                const damage = baseDamage + (levelMultiplier * 8);
                
                this.enemies.push({
                    x: pos.x,
                    y: pos.y,
                    health: health,
                    maxHealth: health,
                    damage: damage
                });
            }
        }
    }

    updateUI() {
        const enemiesLeft = this.enemies.length;
        const itemsLeft = this.items.length;
        
        $('h1').text(`🎮 Уровень ${this.level} | 💯 Счет: ${this.score} | ❤️ HP: ${this.player.health}/${this.player.maxHealth} | ⚔️ Урон: ${this.player.damage} | 👹 Враги: ${enemiesLeft} | 🎁 Предметы: ${itemsLeft}`);
    }    
    
    getRandomEmptyPosition() {
        let attempts = 0;
        while (attempts < 1000) {
            const x = this.random(0, this.width - 1);
            const y = this.random(0, this.height - 1);
            
            if (this.isPositionEmpty(x, y)) {
                return { x, y };
            }
            attempts++;
        }
        return null;
    }
    
    isPositionEmpty(x, y) {
        if (this.map[y][x] !== this.TILE_TYPES.EMPTY) return false;
        
        if (this.player && this.player.x === x && this.player.y === y) return false;
        
        for (let enemy of this.enemies) {
            if (enemy.x === x && enemy.y === y) return false;
        }
        
        for (let item of this.items) {
            if (item.x === x && item.y === y) return false;
        }
        
        return true;
    }
    
    bindEvents() {
        $(document).keydown((e) => {
            if (!this.gameRunning) return;
            
            switch(e.key.toLowerCase()) {
                case 'w':
                    this.movePlayer(0, -1);
                    break;
                case 'a':
                    this.movePlayer(-1, 0);
                    break;
                case 's':
                    this.movePlayer(0, 1);
                    break;
                case 'd':
                    this.movePlayer(1, 0);
                    break;
                case ' ':
                    e.preventDefault();
                    this.playerAttack();
                    break;
            }
        });
    }
    
    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        if (this.isValidMove(newX, newY)) {
            this.player.x = newX;
            this.player.y = newY;
            
            this.checkItemPickup();
            this.moveEnemies();
            this.render();
            this.checkGameState();
        }
    }    
    
    isValidMove(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        if (this.map[y][x] === this.TILE_TYPES.WALL) return false;
        
        for (let enemy of this.enemies) {
            if (enemy.x === x && enemy.y === y) return false;
        }
        
        return true;
    }
    
    checkItemPickup() {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            if (item.x === this.player.x && item.y === this.player.y) {
                if (item.type === 'health') {
                    this.player.health = Math.min(this.player.maxHealth, this.player.health + item.healing);
                } else if (item.type === 'sword') {
                    this.player.damage += item.damage;
                }
                this.items.splice(i, 1);
            }
        }
    }

    playerAttack() {
        const adjacentPositions = [
            { x: this.player.x - 1, y: this.player.y },
            { x: this.player.x + 1, y: this.player.y },
            { x: this.player.x, y: this.player.y - 1 },
            { x: this.player.x, y: this.player.y + 1 },
            { x: this.player.x - 1, y: this.player.y - 1 },
            { x: this.player.x + 1, y: this.player.y - 1 },
            { x: this.player.x - 1, y: this.player.y + 1 },
            { x: this.player.x + 1, y: this.player.y + 1 }
        ];
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            for (let pos of adjacentPositions) {
                if (enemy.x === pos.x && enemy.y === pos.y) {
                    enemy.health -= this.player.damage;
                    
                    if (enemy.health <= 0) {
                        this.enemies.splice(i, 1);
                        this.score += 10 * this.level;
                    }
                    break;
                }
            }
        }
        
        this.moveEnemies();
        this.render();
        this.checkGameState();
    }
    
    moveEnemies() {
        for (let enemy of this.enemies) {
            if (this.isAdjacent(enemy, this.player)) {
                this.player.health -= enemy.damage;
                
                if (this.player.health <= 0) {
                    this.gameOver();
                    return;
                }
            } else {
                const shouldSeekPlayer = this.level > 3 && Math.random() < 0.3;
                
                if (shouldSeekPlayer) {
                    this.moveEnemyTowardsPlayer(enemy);
                } else {
                    this.moveEnemyRandomly(enemy);
                }
            }
        }
    }
    
    moveEnemyTowardsPlayer(enemy) {
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        
        let moveX = 0, moveY = 0;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            moveX = dx > 0 ? 1 : -1;
        } else {
            moveY = dy > 0 ? 1 : -1;
        }
        
        const newX = enemy.x + moveX;
        const newY = enemy.y + moveY;
        
        if (this.isValidEnemyMove(newX, newY)) {
            enemy.x = newX;
            enemy.y = newY;
        } else {
            this.moveEnemyRandomly(enemy);
        }
    }
    
    moveEnemyRandomly(enemy) {
        const directions = [
            { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
        ];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const newX = enemy.x + direction.x;
        const newY = enemy.y + direction.y;
        
        if (this.isValidEnemyMove(newX, newY)) {
            enemy.x = newX;
            enemy.y = newY;
        }
    }
    
    isAdjacent(obj1, obj2) {
        const dx = Math.abs(obj1.x - obj2.x);
        const dy = Math.abs(obj1.y - obj2.y);
        return dx <= 1 && dy <= 1 && (dx + dy > 0);
    }
    
    isValidEnemyMove(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        if (this.map[y][x] === this.TILE_TYPES.WALL) return false;
        
        if (this.player.x === x && this.player.y === y) return false;
        
        for (let enemy of this.enemies) {
            if (enemy.x === x && enemy.y === y) return false;
        }
        
        return true;
    }
    
    render() {
        const field = $('.field');
        field.empty();
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = $('<div class="tile"></div>');
                tile.css({
                    left: x * 25 + 'px',
                    top: y * 25 + 'px'
                });
                
                if (this.map[y][x] === this.TILE_TYPES.WALL) {
                    tile.addClass('tileW');
                }
                
                field.append(tile);
            }
        }
        
        for (let item of this.items) {
            const tile = $('<div class="tile"></div>');
            tile.css({
                left: item.x * 25 + 'px',
                top: item.y * 25 + 'px'
            });
            
            if (item.type === 'health') {
                tile.addClass('tileHP');
            } else if (item.type === 'sword') {
                tile.addClass('tileSW');
            }
            
            field.append(tile);
        }
        
        for (let enemy of this.enemies) {
            const tile = $('<div class="tile tileE"></div>');
            tile.css({
                left: enemy.x * 25 + 'px',
                top: enemy.y * 25 + 'px'
            });
            
            const healthBar = $('<div class="health"></div>');
            const healthPercent = (enemy.health / enemy.maxHealth) * 100;
            healthBar.css('width', healthPercent + '%');
            tile.append(healthBar);
            
            field.append(tile);
        }
        
        if (this.player) {
            const tile = $('<div class="tile tileP"></div>');
            tile.css({
                left: this.player.x * 25 + 'px',
                top: this.player.y * 25 + 'px'
            });
            
            const healthBar = $('<div class="health"></div>');
            const healthPercent = (this.player.health / this.player.maxHealth) * 100;
            healthBar.css('width', healthPercent + '%');
            tile.append(healthBar);
            
            field.append(tile);
        }
        this.updateUI();
    }

    checkGameState() {
        if (this.enemies.length === 0) {
            this.score += 100 * this.level;
            alert(`Уровень ${this.level} пройден! Счет: ${this.score}`);
            
            setTimeout(() => {
                this.nextLevel();
            }, 1000);
        }
    }

    nextLevel() {
        this.level++;
        
        const healAmount = 20 + (this.level * 5);
        this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
        
        if (this.level % 3 === 0) {
            this.player.maxHealth += 25;
            this.player.health = this.player.maxHealth;
        }
        
        const enemyCount = Math.min(10 + Math.floor(this.level / 2) * 3, 25);
        const healthPotionCount = Math.max(12 - Math.floor(this.level / 2), 4);
        const swordCount = Math.min(2 + Math.floor(this.level / 4), 4);
        
        const playerData = {
            health: this.player.health,
            maxHealth: this.player.maxHealth,
            damage: this.player.damage
        };
        
        this.enemies = [];
        this.items = [];
        
        this.generateMap();
        this.placeItems(healthPotionCount, swordCount);
        this.placePlayer();
        this.placeEnemies(enemyCount);
        
        this.player.health = playerData.health;
        this.player.maxHealth = playerData.maxHealth;
        this.player.damage = playerData.damage;
        
        this.render();
        
        const avgEnemyHealth = 50 + ((this.level - 1) * 15);
        const avgEnemyDamage = 15 + ((this.level - 1) * 8);
        
        alert(`🎯 Уровень ${this.level}!\n` +
              `👹 Враги: ${enemyCount} (HP: ${avgEnemyHealth}, Урон: ${avgEnemyDamage})\n` +
              `🧪 Зелья: ${healthPotionCount}\n` +
              `⚔️ Мечи: ${swordCount}\n` +
              `❤️ Ваше HP: ${this.player.health}/${this.player.maxHealth}`);
    }
    
    gameOver() {
        alert(`💀 Игра окончена!\n🎯 Достигнутый уровень: ${this.level}\n💯 Финальный счет: ${this.score}`);
        this.gameRunning = false;
    }
    
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
