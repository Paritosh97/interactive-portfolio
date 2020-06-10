const points = new Array(7);
var imagePopups = new Array(5);
var playerObject = null;
var shouldClose;
var roomEntered = false;
var range = -7;
var ourGame

var BootScene = new Phaser.Class({
    
    Extends: Phaser.Scene,
    
    initialize:
    
    function BootScene() {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },
    
    preload: function () {
        // map tiles
        this.load.image('floor', 'assets/tilesets/floor.png');
        this.load.image('ledges', 'assets/tilesets/ledges.png');
        this.load.image('stairs', 'assets/tilesets/stairs.png');
        this.load.image('tiles', 'assets/tilesets/tiles.png');
        
        // map in json format
        this.load.tilemapTiledJSON('map', 'assets/maps/map.json');
        
        // our player
        this.load.spritesheet('player', 'assets/characters/player.png', { frameWidth: 80, frameHeight: 80 });
        
        // Popups
        this.load.svg('home', 'assets/popups/home.svg', {width: window.innerHeight, height: window.innerHeight});
        this.load.svg('intro', 'assets/popups/intro.svg', {width: window.innerHeight, height: window.innerHeight});
        this.load.svg('about', 'assets/popups/about_me.svg', {width: window.innerHeight, height: window.innerHeight});
        this.load.svg('skills', 'assets/popups/skills.svg', {width: window.innerHeight, height: window.innerHeight});
        this.load.svg('work', 'assets/popups/work.svg', {width: window.innerHeight, height: window.innerHeight});
    },
    
    create: function () {
        // start the WorldScene
        this.scene.start('WorldScene');
        this.scene.start('UIScene');
    }
});

var WorldScene = new Phaser.Class({
    
    Extends: Phaser.Scene,
    
    initialize:
    
    function WorldScene() {
        Phaser.Scene.call(this, { key: 'WorldScene' });
    },
    
    preload: function () {
    },
    
    create: function () {
        
        // create the map
        var map = this.make.tilemap({ key: 'map' });
        
        // first parameter is the name of the tilemap in tiled
        var ledges = map.addTilesetImage('ledges');
        var floor = map.addTilesetImage('floor');
        var stairs = map.addTilesetImage('stairs');
        var tiles = map.addTilesetImage('tiles');
        
        // creating the layers
        var floor = map.createStaticLayer('Floor', floor, 0, 0);
        var stairsLedge = map.createStaticLayer('Stairs Ledge', stairs, 0, 0);
        var stairs = map.createStaticLayer('Stairs', stairs, 0, 0);
        var tiles = map.createStaticLayer('Tiles', tiles, 0, 0);
        var ledges = map.createStaticLayer('Ledge', ledges, 0, 0);
        
        // Assign colliders
        ledges.setCollisionByExclusion([-1]);
        stairsLedge.setCollisionByExclusion([-1]);
        
        //  animation with key 'left', we don't need left and right as we will use one and flip the sprite
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { frames: [0, 1, 2, 3, 4, 5] }),
            frameRate: 10,
            repeat: -1
        });
        
        // animation with key 'right'
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { frames: [0, 1, 2, 3, 4, 5] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { frames: [0, 1, 2, 3, 4, 5] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { frames: [0, 1, 2, 3, 4, 5] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { frames: [0] }),
            frameRate: 10,
            repeat: -1
        });
        
        // Start Point
        points[0] = map.findObject("HomePoint", obj => obj.name === "Spawn Point");
        
        // our player sprite created through the Physics system
        playerObject = this.player = this.physics.add.sprite(points[0].x, points[0].y, 'player', 0);
        
        // Other Room Points
        points[1] = map.findObject("IntroPoint", obj => obj.name === "Spawn Point");
        points[2] = map.findObject("AboutPoint", obj => obj.name === "Spawn Point");
        points[3] = map.findObject("SkillsPoint", obj => obj.name === "Spawn Point");
        points[4] = map.findObject("WorkPoint", obj => obj.name === "Spawn Point");
        points[5] = points[0];
        points[6] = map.findObject("ContactPoint", obj => obj.name === "Spawn Point");
        
        
        
        // Change the body width/height of the player
        this.player.body.setOffset(2);
        this.player.body.setSize(20, 20);
        
        this.player.setScale(0.5);
        
        // Rotate our player towards house
        this.player.angle = -90;
        
        // don't go out of the map
        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.player.setCollideWorldBounds(true);
        
        // don't walk on ledges
        this.physics.add.collider(this.player, ledges);
        this.physics.add.collider(this.player, stairsLedge);
        
        // user input
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Get camera
        var cam = this.cameras.main;
        
        // Limit Camera to Map
        cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        
        // Camera follows player        
        cam.startFollow(this.player);
        cam.roundPixels = true; // avoid tile bleed
        cam.zoom = devicePixelRatio * 6;
    },
    
    update: function (time, delta) {
        this.player.body.setVelocityY(0);
        
        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-60);
        }
        else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(60);
        }
        
        // Vertical movement
        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-60);
        }
        else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(60);
        }
        
        // Update the animation last and give left/right animations precedence over up/down animations
        if (this.cursors.left.isDown) {
            this.player.anims.play('left', true);
            this.player.angle = 180;
        }
        else if (this.cursors.right.isDown) {
            this.player.anims.play('right', true);
            this.player.angle = 0;
        }
        else if (this.cursors.up.isDown) {
            this.player.anims.play('up', true);
            this.player.angle = -90;
        }
        else if (this.cursors.down.isDown) {
            this.player.anims.play('down', true);
            this.player.angle = 90;
        }
        else {
            this.player.anims.play('idle', true);
            this.player.anims.stop();
        }
        
        this.player.body.velocity.normalize().scale(60);
    }
});


var UIScene = new Phaser.Class({
    
    Extends: Phaser.Scene,
    
    initialize:
    
    function UIScene() {
        Phaser.Scene.call(this, { key: 'UIScene', active: true });
    },
    
    create: function () {
        //  Grab a reference to the Game Scene
        ourGame = this.scene.get('WorldScene');
        
        var gameHeight = this.sys.game.config.height;
        var gameWidth = this.sys.game.config.width;
        
        // Popup Images
        imagePopups[0] = this.add.image(gameWidth/2, gameHeight/2, 'home').setVisible(true);
        imagePopups[1] = this.add.image(gameWidth/2, gameHeight/2, 'intro').setVisible(false);
        imagePopups[2] = this.add.image(gameWidth/2, gameHeight/2, 'about').setVisible(false);
        imagePopups[3] = this.add.image(gameWidth/2, gameHeight/2, 'skills').setVisible(false);
        imagePopups[4] = this.add.image(gameWidth/2, gameHeight/2, 'work').setVisible(false);
        
        // Close popups
        this.input.on('pointerdown', function (pointer) {
            shouldClose = true;
            
            // Don't close if hitting the popup
            for (let i = 0; i < imagePopups.length; i++) {
                var deltaX = (pointer.x - imagePopups[i].x) * 2;
                var deltaY = (pointer.y - imagePopups[i].y) * 2;
                
                if (deltaX > 0 && deltaX < imagePopups[i].displayWidth) {
                    if (deltaY > 0 && deltaY < imagePopups[i].displayHeight) {
                        shouldClose = false;
                    }
                }
            }
            
            if (pointer.y > (gameHeight - 100)) {
                shouldClose = false;
            }
            
            if (shouldClose) {
                for (let i = 0; i < imagePopups.length; i++) {
                    imagePopups[i].setVisible(false);
                    ourGame.scene.wake();
                    playerObject.body.setVelocityX(0);
                    playerObject.body.setVelocityY(0);
                }
            }
        });
        
        // Menu        
        var menuButtons = new Array(7);
        
        for (let i = 0; i < menuButtons.length; i++) {
            // Decide text and Set Image
            var text = "";
            var buttonPoint = new Phaser.Math.Vector2(gameWidth / 20 + (i * gameWidth / menuButtons.length), gameHeight - 75);
            switch (i) {
                case 0:
                text = "Home";
                break;
                case 1:
                text = "Introduction";
                break;
                case 2:
                text = "About Me";
                break;
                case 3:
                text = "Skills";
                break;
                case 4:
                text = "Recent Work";
                break;
                case 5:
                text = "Resume";
                break;
                case 6:
                text = "Contact Me";
                break;
            }
            
            menuButtons[i] = this.add.text(buttonPoint.x, buttonPoint.y, text, { fill: '#0f0' });
            menuButtons[i].setOrigin(0.5);
            menuButtons[i].scale = (this.sys.game.config.width * 2.5) / 1920;
            menuButtons[i].setInteractive();
            menuButtons[i].on('pointerover', () => { menuButtons[i].setStyle({ fill: '#ff0' }); });
            menuButtons[i].on('pointerout', () => { menuButtons[i].setStyle({ fill: '#0f0' }); });
            menuButtons[i].on('pointerdown', () => {
                menuButtons[i].setStyle({ fill: '#0ff' });
                playerObject.angle = 270;
                
                imagePopups[0].setVisible(false);
                
                for (let i = 1; i < imagePopups.length; i++) {
                    imagePopups[i].setVisible(false);
                    ourGame.scene.wake();
                }
                
                shouldClose = false;
                
                switch (i) {                    
                    case 1:
                    imagePopups[1].setVisible(true);
                    ourGame.scene.sleep();
                    break;
                    case 2:
                    imagePopups[2].setVisible(true);
                    ourGame.scene.sleep();
                    break;
                    case 3:
                    playerObject.angle = 180;
                    imagePopups[3].setVisible(true);
                    ourGame.scene.sleep();
                    break;
                    case 4:
                    imagePopups[4].setVisible(true);
                    ourGame.scene.sleep();
                    break;
                    case 5:
                    points[i] = playerObject;
                    window.open("/assets/resume/resume.pdf");
                    break;
                    case 6:
                    // Call Formspree
                    break;
                }
                
                // Player repositioning
                playerObject.body.reset(points[i].x, points[i].y);
            });
            menuButtons[i].on('pointerup', () => { menuButtons[i].setStyle({ fill: '#0f0' }); });
            menuButtons[i].setScrollFactor(0);
        }
    },
    
    update: function (time, delta) {        
        if(playerObject != null)
        {
            for(var i = 1; i < points.length && i != 5; i++)
            {
                var temp = playerObject.body.position.y - points[i].y;
                if(!roomEntered)
                {
                    if(temp < 0 && temp > range)
                    {
                        //console.log(i);
                        roomEntered = true;
                        
                        if(i == 6)
                        {
                            // Formspree
                        }
                        
                        if(ourGame.cursors.up.isDown && i != 3 && i != 6)
                        {
                            imagePopups[i].setVisible(true);
                            ourGame.scene.sleep();
                        }
                        
                        if(i == 3 && ourGame.cursors.up.isLeft)
                        {
                            imagePopups[i].setVisible(true);
                            ourGame.scene.sleep();
                        }
                    }
                }
                else
                {
                    //console.log("nope");
                    if(temp < range)
                    {
                        roomEntered = false;
                    }
                }             
            }
        }
    }
});


var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        width: window.innerWidth * window.devicePixelRatio,
        height: window.innerHeight * window.devicePixelRatio,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // set to true to view zones
        }
    },
    scene: [
        BootScene,
        WorldScene,
        UIScene
    ]
};

var game = new Phaser.Game(config);