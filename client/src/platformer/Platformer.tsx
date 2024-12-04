// src/Platformer.tsx
import React, { useEffect, useRef, useState } from 'react';
import styles from './Platformer.module.css';
import Player from './components/Player';
import Platform from './components/Platform';
import MovingPlatform from './components/MovingPlatform';
import Obstacle from './components/Obstacle';
import Collectible from './components/Collectible';
import DeathScreen from './components/DeathScreen';

const WORLD_WIDTH = 5000;
const WORLD_HEIGHT = 1000;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 100;
const GRAVITY = 0.5; // Updated gravity
const JUMP_SPEED = -12; // Updated jump speed
const ACCELERATION = 1; // Updated acceleration
const FRICTION = 0.85; // Updated friction
const MAX_SPEED = 10; // Updated max speed

interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface PlatformType extends GameObject {
    dx?: number;
    dy?: number;
    rangeX?: number;
    rangeY?: number;
    startX?: number;
    startY?: number;
}

interface CollectibleType extends GameObject {
    collected: boolean;
    type: 'score' | 'health';
    baseY: number;
    floatOffset: number;
}

interface ObstacleType extends GameObject {
    damage: number;
    color: string;
    hit?: boolean;
}

const Platformer: React.FC = () => {
    const [viewport, setViewport] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [camera, setCamera] = useState({ x: 0, y: 0 });
    const [player, setPlayer] = useState({
        x: 100,
        y: WORLD_HEIGHT - PLAYER_HEIGHT,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        vx: 0,
        vy: 0,
        onGround: false,
        onPlatform: false,
    });
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(100);
    const [gameOver, setGameOver] = useState(false);

    const keys = useRef<{ [key: string]: boolean }>({});
    const requestRef = useRef<number>();

    // Platforms
    const platforms: PlatformType[] = [
        // Left wall
        { x: 0, y: 0, width: 10, height: WORLD_HEIGHT },
        // Ground
        { x: 0, y: WORLD_HEIGHT - 20, width: WORLD_WIDTH, height: 20 },
        // Static platforms
        { x: 200, y: WORLD_HEIGHT - 120, width: 150, height: 20 },
        { x: 600, y: WORLD_HEIGHT - 220, width: 200, height: 20 },
        // Moving platform
        {
            x: 1000,
            y: WORLD_HEIGHT - 320,
            width: 150,
            height: 20,
            dx: 2,
            rangeX: 300,
            startX: 1000,
        },
        // Additional platforms
        { x: 1500, y: WORLD_HEIGHT - 420, width: 150, height: 20 },
        { x: 2000, y: WORLD_HEIGHT - 520, width: 200, height: 20 },
        // ... Add more platforms as needed
    ];

    // Obstacles
    const obstacles: ObstacleType[] = [
        { x: 400, y: WORLD_HEIGHT - 40, width: 20, height: 40, damage: 25, color: 'gray' },
        { x: 800, y: WORLD_HEIGHT - 60, width: 30, height: 60, damage: 50, color: 'darkgray' },
        // Additional obstacles
        { x: 1200, y: WORLD_HEIGHT - 50, width: 25, height: 50, damage: 25, color: 'gray' },
        { x: 1600, y: WORLD_HEIGHT - 70, width: 35, height: 70, damage: 50, color: 'darkgray' },
        // ... Add more obstacles as needed
    ];

    // Collectibles
    const [collectibles, setCollectibles] = useState<CollectibleType[]>([
        // Collectibles on the ground
        ...Array.from({ length: 10 }, (_, i) => ({
            x: 200 + i * 400, // Spread along the ground
            y: WORLD_HEIGHT - 50, // On top of the ground
            width: 20,
            height: 20,
            collected: false,
            type: Math.random() < 0.5 ? 'health' : 'score',
            baseY: WORLD_HEIGHT - 50,
            floatOffset: Math.random() * Math.PI * 2,
        })),
        // Collectibles on platforms
        ...platforms
            .filter((platform) => platform.y < WORLD_HEIGHT - 50) // Exclude the ground platform
            .map((platform) => ({
                x: platform.x + platform.width / 2 - 10, // Centered on the platform
                y: platform.y - 20, // On top of the platform
                width: 20,
                height: 20,
                collected: false,
                type: Math.random() < 0.5 ? 'health' : 'score',
                baseY: platform.y - 20,
                floatOffset: Math.random() * Math.PI * 2,
            })),
    ]);

    const [gamePlatforms, setGamePlatforms] = useState(platforms);

    // Handle key events
    const handleKeyDown = (e: KeyboardEvent) => {
        keys.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        keys.current[e.code] = false;
    };

    const restartGame = () => {
        setPlayer({
            x: 100,
            y: WORLD_HEIGHT - PLAYER_HEIGHT,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            vx: 0,
            vy: 0,
            onGround: false,
            onPlatform: false,
        });
        setHealth(100);
        setScore(0);
        setGameOver(false);
        setCollectibles((prevCollectibles) =>
            prevCollectibles.map((item) => ({
                ...item,
                collected: false,
                y: item.baseY,
                floatOffset: Math.random() * Math.PI * 2,
            }))
        );
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        const handleResize = () => {
            setViewport({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const gameLoop = () => {
        setPlayer((prev) => {
            let { x, y, vx, vy, onGround, height, onPlatform } = prev;

            // Horizontal Movement
            if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
                vx -= ACCELERATION;
            }
            if (keys.current['ArrowRight'] || keys.current['KeyD']) {
                vx += ACCELERATION;
            }

            // Apply friction
            vx *= FRICTION;

            // Limit speed
            vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, vx));

            // Jumping
            if ((keys.current['Space'] || keys.current['ArrowUp'] || keys.current['KeyW']) && onGround) {
                vy = JUMP_SPEED;
                onGround = false;
            }

            // Crouching
            if (keys.current['ShiftLeft'] || keys.current['ArrowDown'] || keys.current['KeyS']) {
                height = PLAYER_HEIGHT / 2;
            } else {
                height = PLAYER_HEIGHT;
            }

            // Apply Gravity
            if (!onGround) {
                vy += GRAVITY;
            }

            x += vx;
            y += vy;

            // Keep within world bounds
            x = Math.max(0, Math.min(WORLD_WIDTH - PLAYER_WIDTH, x));
            y = Math.min(y, WORLD_HEIGHT - height);

            // Ground Collision
            if (y + height >= WORLD_HEIGHT) {
                y = WORLD_HEIGHT - height;
                vy = 0;
                onGround = true;
                onPlatform = false;
            } else {
                onGround = false;
                onPlatform = false;
            }

            // Platform Collision
            gamePlatforms.forEach((platform) => {
                // Update moving platforms
                if (platform.dx) {
                    if (platform.startX === undefined) platform.startX = platform.x;
                    platform.x += platform.dx;
                    if (Math.abs(platform.x - platform.startX) >= platform.rangeX!) {
                        platform.dx = -platform.dx; // Reverse direction
                    }
                }
                if (platform.dy) {
                    if (platform.startY === undefined) platform.startY = platform.y;
                    platform.y += platform.dy;
                    if (Math.abs(platform.y - platform.startY) >= platform.rangeY!) {
                        platform.dy = -platform.dy; // Reverse direction
                    }
                }

                // Collision detection
                if (
                    x + PLAYER_WIDTH > platform.x &&
                    x < platform.x + platform.width &&
                    y + height > platform.y &&
                    y + height - vy <= platform.y &&
                    vy >= 0
                ) {
                    y = platform.y - height;
                    vy = 0;
                    onGround = true;
                    onPlatform = true;

                    // Move with platform
                    if (platform.dx) {
                        x += platform.dx;
                    }
                    if (platform.dy) {
                        y += platform.dy;
                    }
                }
            });

            // Obstacle Collision
            obstacles.forEach((obstacle) => {
                if (
                    x + PLAYER_WIDTH > obstacle.x &&
                    x < obstacle.x + obstacle.width &&
                    y + height > obstacle.y &&
                    y < obstacle.y + obstacle.height
                ) {
                    if (!obstacle.hit) {
                        const damage = obstacle.damage;
                        setHealth((prevHealth) => {
                            const newHealth = prevHealth - damage;
                            if (newHealth <= 0) {
                                setGameOver(true);
                                return 0;
                            } else {
                                return newHealth;
                            }
                        });
                        obstacle.hit = true;
                    }
                } else {
                    obstacle.hit = false;
                }
            });

            // Collectibles Collision
            setCollectibles((prevCollectibles) =>
                prevCollectibles.map((item) => {
                    if (
                        !item.collected &&
                        x + PLAYER_WIDTH > item.x &&
                        x < item.x + item.width &&
                        y + height > item.y &&
                        y < item.y + item.height
                    ) {
                        if (item.type === 'score') {
                            setScore((prevScore) => prevScore + 10);
                        } else if (item.type === 'health') {
                            setHealth((prevHealth) => Math.min(prevHealth + 25, 100));
                        }
                        return { ...item, collected: true };
                    }
                    return item;
                })
            );

            // Update camera position
            let camX = x - viewport.width / 2 + PLAYER_WIDTH / 2;
            let camY = y - viewport.height / 2 + height / 2;

            camX = Math.max(0, Math.min(camX, WORLD_WIDTH - viewport.width));
            camY = Math.max(0, Math.min(camY, WORLD_HEIGHT - viewport.height));

            setCamera({ x: camX, y: camY });

            return { x, y, vx, vy, width: PLAYER_WIDTH, height, onGround, onPlatform };
        });

        // Update moving platforms
        setGamePlatforms((prevPlatforms) => {
            return prevPlatforms.map((platform) => ({ ...platform }));
        });

        // Animate collectibles
        setCollectibles((prevCollectibles) =>
            prevCollectibles.map((item) => {
                if (!item.collected) {
                    const floatSpeed = 0.05;
                    const floatRange = 10;
                    const newOffset = item.floatOffset + floatSpeed;
                    const offsetY = Math.sin(newOffset) * floatRange;
                    return { ...item, y: item.baseY + offsetY, floatOffset: newOffset };
                }
                return item;
            })
        );

        if (!gameOver) {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(requestRef.current!);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameOver]);

    return (
        <div className={styles.gameContainer}>
            <div
                className={styles.gameWorld}
                style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}
            >
                {/* Player */}
                <Player
                    x={player.x - camera.x}
                    y={player.y - camera.y}
                    width={player.width}
                    height={player.height}
                />

                {/* Platforms */}
                {gamePlatforms.map((platform, index) =>
                    platform.dx || platform.dy ? (
                        <MovingPlatform
                            key={index}
                            x={platform.x - camera.x}
                            y={platform.y - camera.y}
                            width={platform.width}
                            height={platform.height}
                        />
                    ) : (
                        <Platform
                            key={index}
                            x={platform.x - camera.x}
                            y={platform.y - camera.y}
                            width={platform.width}
                            height={platform.height}
                        />
                    )
                )}

                {/* Obstacles */}
                {obstacles.map((obstacle, index) => (
                    <Obstacle
                        key={index}
                        x={obstacle.x - camera.x}
                        y={obstacle.y - camera.y}
                        width={obstacle.width}
                        height={obstacle.height}
                        color={obstacle.color}
                    />
                ))}

                {/* Collectibles */}
                {collectibles.map(
                    (item, index) =>
                        !item.collected && (
                            <Collectible
                                key={index}
                                x={item.x - camera.x}
                                y={item.y - camera.y}
                                width={item.width}
                                height={item.height}
                                type={item.type}
                            />
                        )
                )}
            </div>

            {/* UI Elements */}
            <div className={styles.score}>Score: {score}</div>
            <div className={styles.healthBarContainer}>
                <div
                    className={styles.healthBar}
                    style={{ width: `${health}%` }}
                ></div>
            </div>

            {/* Death Screen */}
            {gameOver && <DeathScreen onRestart={restartGame} />}
        </div>
    );
};

export default Platformer;
