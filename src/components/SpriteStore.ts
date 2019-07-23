interface Dictionary<T> {
    [K: string]: T;
}

export interface Sprite {
    src: string;
    index: number;
    size?: number;
    alt?: string;
    finalSize?: number;
}

interface GalleryStore {
    name: string,
    image: string,
    height?: number,
    width?: number,
    frames?: string[],
}

const gallery: GalleryStore[] = [
    { name: 'bigFood', image: './gallery-icons/bigFood/big.png', height: 32, width: 32, frames: ['Burger', 'Drumstick', 'Ham', 'Pizza', 'Taco', 'Cake', 'Donut', 'IceCream'] },
    // { name: 'plate', image: './gallery-icons/bigFood/plate.png', frames: [] },
    { name: 'heroFrontAttack', image: './gallery-icons/castle/heroFrontAttack.png', height: 24, width: 24, frames: ['1'] },
    { name: 'heroSideAttack', image: './gallery-icons/castle/heroSideAttack.png', height: 24, width: 24, frames: ['Left1', 'Left2', 'Left3', 'Left4', 'Right4', 'Right3', 'Right2', 'Right1'] },
    { name: 'heroWalk', image: './gallery-icons/castle/heroWalk.png', height: 16, width: 16, frames: ['Front1', 'Front2', 'Front3', 'Front4', 'Back1', 'Back2', 'Back3', 'Back4'] },
    { name: 'heroWalkShield', image: './gallery-icons/castle/heroWalkShield.png', height: 16, width: 16, frames: ['Front1', 'Front2', 'Front3', 'Front4', 'Back1', 'Back2', 'Back3', 'Back4'] },
    { name: 'heroWalkShieldSide', image: './gallery-icons/castle/heroWalkShieldSide.png', height: 16, width: 16, frames: ['Left1', 'Left2', 'Left3', 'Left4', 'Right4', 'Right3', 'Right2', 'Right1'] },
    { name: 'heroWalkSide', image: './gallery-icons/castle/heroWalkSide.png', height: 16, width: 16, frames: ['Left1', 'Left2', 'Left3', 'Left4', 'Right4', 'Right3', 'Right2', 'Right1'] },
    { name: 'house', image: './gallery-icons/castle/house.png', height: 48, width: 48, frames: ['Red', 'Blue'] },
    { name: 'princess', image: './gallery-icons/castle/princess.png', height: 16, width: 16, frames: ['Front0', 'Front1', 'Front2', 'Left0', 'Left1', 'Left2', 'Back0', 'Back1', 'Back2'] },
    { name: 'princess2', image: './gallery-icons/castle/princess2.png', height: 16, width: 16, frames: ['Front', 'WalkFront1', 'WalkFront2', 'WalkFront3', 'Back', 'WalkBack1', 'WalkBack2', 'WalkBack3', 'Left1', 'Left2', 'Right1', 'Right2'] },
    { name: 'sapling', image: './gallery-icons/castle/sapling.png', height: 16, width: 16, frames: ['Oak', 'Pine'] },
    { name: 'skelly', image: './gallery-icons/castle/skelly.png', height: 24, width: 24, frames: ['Front', 'WalkFront1', 'WalkFront2', 'WalkFront3', 'AttackFront1', 'AttackFront2', 'AttackFront3', 'AttackFront4', 'WalkLeft1', 'AttackLeft1', 'AttackLeft2', 'WalkLeft2', 'WalkRight1', 'AttackRight1', 'AttackRight2', 'WalkRight2'] },
    { name: 'tile', image: './gallery-icons/castle/tile.png', height: 16, width: 16, frames: ['Grass1', 'Grass2', 'Path1', 'Path2', 'Path3', 'DarkGrass1', 'DarkGrass2', 'Path4', 'Path5', 'Path6', 'Grass3', 'DarkGrass3', 'Path7', 'Path8', 'Path9'] },
    { name: 'tree', image: './gallery-icons/castle/tree.png', height: 32, width: 32, frames: ['Pine', 'Oak'] },
    { name: 'treeSmallPine', image: './gallery-icons/castle/treeSmallPine.png', height: 32, width: 16, frames: [''] },
    { name: 'duck', image: './gallery-icons/duck/duck.png', height: 16, width: 16, frames: ['1'] },
    // { name: 'log1', image: './gallery-icons/duck/log1.png', frames: [] },
    // { name: 'log2', image: './gallery-icons/duck/log2.png', frames: [] },
    // { name: 'log3', image: './gallery-icons/duck/log3.png', frames: [] },
    // { name: 'log4', image: './gallery-icons/duck/log4.png', frames: [] },
    // { name: 'log5', image: './gallery-icons/duck/log5.png', frames: [] },
    // { name: 'log6', image: './gallery-icons/duck/log6.png', frames: [] },
    // { name: 'log7', image: './gallery-icons/duck/log7.png', frames: [] },
    // { name: 'log8', image: './gallery-icons/duck/log8.png', frames: [] },
    // { name: 'tree', image: './gallery-icons/duck/tree.png', frames: [] },
    // { name: 'duckHurt', image: './gallery-icons/duck/duckHurt.png', frames: [] },
    { name: 'smallFood', image: './gallery-icons/smallFood/small.png', height: 16, width: 16, frames: ['Burger', 'Apple', 'Lemon', 'Drumstick', 'Ham', 'Pizza', 'Donut', 'Cake', 'IceCream', 'Strawberry', 'Cherries', 'Taco'] },
    { name: 'space', image: './gallery-icons/space/space.png', height: 16, width: 16, frames: ['SmallAsteroid0', 'SmallAsteroid1', 'SmallAsteroid2', 'SmallAsteroid3', 'Asteroid0', 'Asteroid1', 'SmallAsteroid4', 'SmallAsteroid5', 'RedShip', 'Asteroid2', 'Asteroid3', 'Asteroid4', 'OrangeShip', 'PinkShip', 'BlueShip', 'GreenShip'] },
    { name: 'car', image: './gallery-icons/vehicle/car.png', height: 16, width: 16, frames: ['RedLeft', 'RedRight', 'RedBack', 'RedFront', 'BlueLeft', 'BlueRight', 'BlueBack', 'BlueFront', 'PinkLeft', 'PinkRight', 'PinkBack', 'PinkFront'] },
    { name: 'road', image: './gallery-icons/vehicle/road.png', height: 16, width: 16, frames: ['Turn1', 'Turn2', 'Turn4', 'Intersection1', 'Intersection2', 'Vertical', 'Turn3', 'Horizontal', 'Intersection3', 'Intersection4'] },
];