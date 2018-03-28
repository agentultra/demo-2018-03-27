const canvas = document.getElementById('stage')
, stage = canvas.getContext('2d')
, stageW = 800
, stageH = 400
, buttons = {
    Left: 0,
    Right: 0,
    Up: 0,
    Down: 0,
    Fire: 0
}

canvas.width = stageW
canvas.height = stageH

const state = {}
, enemyType = {
    Swifter: (x, y) => {
        return {x, y, type: 'swifter', kill: false, points: 5}
    }
}

let ticks = 0

const clr = () => {
    stage.fillStyle = 'black'
    stage.fillRect(0, 0, stageW, stageH)
}

const btn = name => buttons.hasOwnProperty(name) && buttons[name]

const clamp = (min, max, v) =>
      v < min ? min : v > max ? max : v

const range = (min, max) => {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

const collision = (x1, y1, w1, h1,
                   x2, y2, w2, h2) =>
      !((x1 + w1 < x2) ||
        (x1 > x2 + w2) ||
        (y1 + h1 < y2) ||
        (y1 > y2 + h2))

const Bullet = (x, y, speed=20) => ({
    x, y, speed
})

const PowerUp = (x, y) => ({
    x, y
})

const init = () =>
      Object.assign(state, {
          player: {
              x: Math.floor(stageW / 2) - 10,
              y: stageH - 30,
              vx: 0, vy: 0,
              speed: 4,
              lastFire: 0,
              fireRate: 40,
              maxFireRate: 5
          },
          playerBullets: [],
          powerUps: [],
          enemies: [],
          score: 0
      })

const updateEnemy = e => {
    if (e.type === 'swifter') {
        e.x += Math.floor(Math.sin(ticks * 0.2) * 0.2)
        e.y += 2
    }
    if (e.y > stageH)
        e.kill = true
}

const update = dt => {
    const {player, playerBullets, powerUps, enemies} = state
    player.vy = btn('Down')
        ? player.speed
        : btn('Up')
        ? -player.speed
        : 0
    player.vx = btn('Right')
        ? player.speed
        : btn('Left')
        ? -player.speed
        : 0
    if (btn('Fire')) {
        if (ticks - player.lastFire > player.fireRate) {
            playerBullets.push(Bullet(player.x + 10, player.y - 4, -18))
            player.lastFire = ticks
        }
    }
    if (ticks % 30 === 0)
        player.fireRate += 1
    player.x = clamp(0, stageW - 20, player.x + player.vx)
    player.y = clamp(0, stageH - 20, player.y + player.vy)

    if (ticks % 20 === 0 && Math.random() < 0.2)
        powerUps.push(PowerUp(
            range(20, stageW - 20),
            -10
        ))

    for (let p of powerUps) {
        p.y = p.y + 4

        if (collision(player.x, player.y, 20, 20,
                      p.x, p.y, 10, 10)) {
            player.fireRate = clamp(player.maxFireRate, 40, player.fireRate - 10)
            p.kill = true
        }

        if (p.y > stageH)
            p.kill = true
    }
    state.powerUps = powerUps.filter(x => x.kill != true)

    if (ticks % range(20, 40) === 0 && Math.random() < 0.2) {
        enemies.push(enemyType.Swifter(range(30, 770), -40))
    }

    for (let enemy of enemies) {
        updateEnemy(enemy)
    }

    for (let b of playerBullets) {
        b.y += b.speed
        for (let e of enemies) {
            if (collision(b.x, b.y, 4, 5,
                          e.x, e.y, 20, 20)) {
                e.kill = true
                b.kill = true
                state.score += e.points
            }
        }
        if (b.y < 0)
            b.kill = true
    }
    state.playerBullets = playerBullets.filter(x => x.kill != true)
    state.enemies = enemies.filter(x => x.kill != true)
}

const render = () => {
    const {player, playerBullets, powerUps, enemies} = state
    clr()

    stage.fillStyle = 'yellow'
    stage.fillRect(player.x, player.y,
                   20, 20)
    for (let b of playerBullets) {
        stage.fillStyle = 'white'
        stage.fillRect(b.x, b.y, 4, 5)
    }

    for (let p of powerUps) {
        stage.fillStyle = 'purple'
        stage.fillRect(p.x, p.y, 10, 10)
    }

    for (let e of enemies) {
        stage.fillStyle =
            e.type === 'swifter'
            ? 'red'
            : 'black'
        stage.fillRect(e.x, e.y, 20, 20)
    }

    stage.fillStyle = 'white'
    stage.fillText(`Score: ${state.score}`, 5, 15)
}

const loop = dt => {
    update(dt)
    render()
    window.requestAnimationFrame(loop)
    ticks++
}

init()
window.requestAnimationFrame(loop)

document.addEventListener('keydown', ev => {
    if (ev.key === ' ') {
        buttons.Fire = 1
    } else if (ev.key === 'a') {
        buttons.Left = 1
    } else if (ev.key === 'd') {
        buttons.Right = 1
    } else if (ev.key === 's') {
        buttons.Down = 1
    } else if (ev.key === 'w') {
        buttons.Up = 1
    }
})

document.addEventListener('keyup', ev => {
    if (ev.key === ' ') {
        buttons.Fire = 0
    } else if (ev.key === 'a') {
        buttons.Left = 0
    } else if (ev.key === 'd') {
        buttons.Right = 0
    } else if (ev.key === 's') {
        buttons.Down = 0
    } else if (ev.key === 'w') {
        buttons.Up = 0
    }
})
