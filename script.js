// Agar.io Lite Modded by GamerJig
(function(){
    // Create UI
    const uiHTML = `
    <div id="ui" style="position:fixed;top:10px;left:10px;z-index:10;color:white;font-family:sans-serif;">
        <ul>
            <li>Player Color: <input type="color" id="playerColor" value="#ffffff"></li>
            <li>Circle's speed: <input type="number" id="circleMaxSpeed" min="1" value="3"></li>
            <li id="scoreUi">Score: 0</li>
        </ul>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', uiHTML);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    // cg object
    var cg = {
        playerColor:'#ffffff',
        score:0,
        lastTime:Date.now(),
        circles:[],
        paused:false,
        config:{
            width:640,
            height:960,
            autosize:true,
            circle:{
                count:1.75,
                minRadius:5,
                maxRadius:55,
                playerRadius:10,
                radiusInterval:10,
                speedScale:3,
                colors:["White","Blue","DeepSkyBlue","MediumSlateBlue","Aquamarine","Lime","Indigo","Red","DarkRed","Fuchsia","Magenta","Orange","OrangeRed","GreenYellow","Purple"]
            },
            touchmove:'ontouchmove' in window
        },
        ctx: canvas.getContext('2d'),
        scoreUpdate:function(amount){
            this.score += amount;
            document.getElementById("scoreUi").textContent = "Score: "+this.score;
        },
        hideCursor:function(){canvas.style.cursor='none';},
        showCursor:function(){canvas.style.cursor='default';},
        maxCircles:function(){return Math.round(this.config.width*this.config.height/(10000*this.config.circle.count));},
        autosize:function(){if(this.config.autosize){this.config.width=window.innerWidth;this.config.height=window.innerHeight;canvas.width=this.config.width;canvas.height=this.config.height;}},
        start:function(){
            this.score=0;document.getElementById("scoreUi").textContent="Score: 0";
            this.player=new Player();this.player.color=this.playerColor;
            this.config.circle.colors[0]=this.player.color;
            this.circles=[];
            this.hideCursor();
            if(this.config.touchmove) document.addEventListener('touchmove', this.touchMove.bind(this),{passive:false});
            else canvas.addEventListener('mousemove', this.mouseMove.bind(this));
            window.addEventListener('blur',()=>this.pause());
            window.addEventListener('keydown',e=>{if(e.keyCode==32){this.togglePause();e.preventDefault();}});
        },
        pause:function(){this.paused=true;this.showCursor();},
        unpause:function(){this.paused=false;this.hideCursor();},
        togglePause:function(){this.paused?this.unpause():this.pause();},
        tick:function(){
            const now=Date.now();
            const elapsed=now-this.lastTime;
            this.lastTime=now;
            requestAnimationFrame(this.tick.bind(this));
            this.autosize();
            this.ctx.clearRect(0,0,this.config.width,this.config.height);
            if(this.circles.length<this.maxCircles()&&Math.random()<0.25) this.circles.push(new Circle());
            for(let i=0;i<this.circles.length;i++) if(this.circles[i].tick()) i--;
            if(this.player) this.player.tick();
        },
        mouseMove:function(e){if(!this.paused){this.player.x=e.clientX;this.player.y=e.clientY;}},
        touchMove:function(e){e.preventDefault();const t=e.touches[0]||e.changedTouches[0];this.mouseMove(t);}
    };

    function rand(min,max,interval){return min+Math.floor(Math.random()*(Math.floor((max-min)/interval)+1))*interval;}

    var Circle=function(){
        var min=cg.config.circle.minRadius,max=cg.config.circle.maxRadius;
        if(cg.player){if(min<cg.player.radius-35)min=cg.player.radius-35;if(max<cg.player.radius+15)max=cg.player.radius+15;}
        this.radius=rand(min,max,cg.config.circle.radiusInterval);
        this.color=cg.config.circle.colors[Math.floor(Math.random()*cg.config.circle.colors.length)];
        this.x=Math.random()*cg.config.width;
        this.y=Math.random()*cg.config.height;
        this.vx=(Math.random()-.5)*cg.config.circle.speedScale;
        this.vy=(Math.random()-.5)*cg.config.circle.speedScale;
        if(Math.abs(this.vx)+Math.abs(this.vy)<1){this.vx=this.vx<0?-1:1;this.vy=this.vy<0?-1:1;}
        this.tick=function(){
            this.x+=this.vx;this.y+=this.vy;this.render();return false;
        }
        this.render=function(){
            cg.ctx.beginPath();cg.ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);cg.ctx.fillStyle=this.color;cg.ctx.closePath();cg.ctx.fill();
        }
    }

    var Player=function(){
        this.x=cg.config.width/2;
        this.y=cg.config.height/2;
        this.radius=cg.config.circle.playerRadius;
        this.color='white';
        this.tick=function(){
            for(let i=0;i<cg.circles.length;i++){
                const c=cg.circles[i];
                const dist=Math.hypot(c.x-this.x,c.y-this.y);
                if(dist<c.radius+this.radius){
                    if(c.radius>this.radius){cg.player=null;return;}
                    else{if(c.color==this.color){cg.scoreUpdate(5);this.radius+=5;} else{cg.scoreUpdate(1);this.radius++;} cg.circles.splice(i,1);i--;}
                }
            }
            cg.ctx.beginPath();cg.ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);cg.ctx.fillStyle=this.color;cg.ctx.closePath();cg.ctx.fill();
        }
    }

    cg.tick();
    cg.start();

    // Player color event
    document.getElementById("playerColor").addEventListener('input',e=>{cg.playerColor=e.target.value;});

    // Circle speed event
    document.getElementById("circleMaxSpeed").addEventListener('input',e=>{
        cg.config.circle.speedScale=Number(e.target.value);
    });
})();
