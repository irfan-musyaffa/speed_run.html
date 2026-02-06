 let scene, camera, renderer, player;
        let obstacles = [];
        let score = 0;
        let gameActive = true;
        let speed = 0.5;
        let targetLane = 0; // -1: Kiri, 0: Tengah, 1: Kanan
        const laneWidth = 3;

        function init() {
            // 1. Setup Scene
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x000000, 0.05);

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 3, 7);
            camera.lookAt(0, 0, 0);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            // 2. Lampu
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);

            const light = new THREE.PointLight(0x00ffff, 1, 100);
            light.position.set(0, 10, 0);
            scene.add(light);

            // 3. Lantai (Jalanan Neon)
            const groundGeo = new THREE.PlaneGeometry(10, 1000);
            const groundMat = new THREE.MeshPhongMaterial({ 
                color: 0x111111, 
                emissive: 0x222222 
            });
            const ground = new THREE.Mesh(groundGeo, groundMat);
            ground.rotation.x = -Math.PI / 2;
            scene.add(ground);

            // Garis pembatas jalan
            for(let i = -1; i <= 1; i++) {
                const lineGeo = new THREE.PlaneGeometry(0.1, 1000);
                const lineMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
                const line = new THREE.Mesh(lineGeo, lineMat);
                line.rotation.x = -Math.PI / 2;
                line.position.set(i * laneWidth + (i === 0 ? 0 : (i > 0 ? -laneWidth/2 : laneWidth/2)), 0.01, 0);
                scene.add(line);
            }

            // 4. Player (Karakter)
            const playerGeo = new THREE.BoxGeometry(1, 1, 1);
            const playerMat = new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.5 });
            player = new THREE.Mesh(playerGeo, playerMat);
            player.position.y = 0.6;
            scene.add(player);

            // Input
            window.addEventListener('keydown', (e) => {
                if (!gameActive) return;
                if (e.key === 'ArrowLeft' || e.key === 'a') {
                    if (targetLane > -1) targetLane--;
                }
                if (e.key === 'ArrowRight' || e.key === 'd') {
                    if (targetLane < 1) targetLane++;
                }
            });

            animate();
            setInterval(spawnObstacle, 1000);
        }

        function spawnObstacle() {
            if (!gameActive) return;
            
            const lanes = [-laneWidth, 0, laneWidth];
            const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
            
            const obsGeo = new THREE.BoxGeometry(1.5, Math.random() * 2 + 1, 1.5);
            const obsMat = new THREE.MeshPhongMaterial({ color: 0xff00ff, emissive: 0xff00ff });
            const obstacle = new THREE.Mesh(obsGeo, obsMat);
            
            obstacle.position.set(randomLane, obsGeo.parameters.height / 2, -100);
            scene.add(obstacle);
            obstacles.push(obstacle);
        }

        function animate() {
            if (!gameActive) return;
            requestAnimationFrame(animate);

            // Gerakkan Player ke jalur target (Llerp untuk animasi mulus)
            const targetX = targetLane * laneWidth;
            player.position.x += (targetX - player.position.x) * 0.1;

            // Efek lompat kecil (bobbing)
            player.position.y = 0.6 + Math.abs(Math.sin(Date.now() * 0.01)) * 0.2;

            // Update Obstacles
            for (let i = obstacles.length - 1; i >= 0; i--) {
                obstacles[i].position.z += speed;

                // Cek Tabrakan
                const dist = player.position.distanceTo(obstacles[i].position);
                if (dist < 1.5) {
                    gameOver();
                }

                // Hapus jika sudah lewat kamera
                if (obstacles[i].position.z > 10) {
                    scene.remove(obstacles[i]);
                    obstacles.splice(i, 1);
                    score += 10;
                    document.getElementById('score').innerText = `SKOR: ${score}`;
                    speed += 0.005; // Makin lama makin cepat
                }
            }

            renderer.render(scene, camera);
        }

        function gameOver() {
            gameActive = false;
            document.getElementById('game-over').style.display = 'block';
            document.getElementById('final-score').innerText = `Skor Akhir: ${score}`;
        }

        function resetGame() {
            // Hapus semua obstacle
            obstacles.forEach(obs => scene.remove(obs));
            obstacles = [];
            score = 0;
            speed = 0.5;
            targetLane = 0;
            player.position.x = 0;
            gameActive = true;
            document.getElementById('score').innerText = `SKOR: 0`;
            document.getElementById('game-over').style.display = 'none';
            animate();
        }

        init();