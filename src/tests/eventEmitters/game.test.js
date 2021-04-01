import assert       from"assert"
import sinon        from"sinon"
import EventEmitter from"events"

import game from "../../lib/eventEmitters/game"

describe("eventEmitters/game()", function() {

  const telemetry = {
    game: new EventEmitter()
  }

  const spies = {
    pause:       sinon.spy(),
    timeChange:  sinon.spy(),
    fine:        sinon.spy(),
    tollgate:    sinon.spy(),
    ferry:       sinon.spy(),
    train:       sinon.spy(),
    refuelPaid:  sinon.spy()
  }

  const createData = () => ({
    game: {
      paused:        false,
      time:          100,
      pluginVersion: 10
    },
    events: {
      fine:        {active: false, amount: 100, offence: "foobar"},
      tollgate:    {active: false, amount: 200},
      ferry:       {active: false, amount: 300, source: "foo", destination: "bar"},
      train:       {active: false, amount: 400, source: "foo", destination: "bar"},
      refuelPaid:  {active: false, amount: 500}
    }
  })

  before(function() {
    const data = [createData(), createData()]

    telemetry.game.on("pause",        spies.pause)
    telemetry.game.on("time-change",  spies.timeChange)
    telemetry.game.on("fine",         spies.fine)
    telemetry.game.on("tollgate",     spies.tollgate)
    telemetry.game.on("ferry",        spies.ferry)
    telemetry.game.on("train",        spies.train)
    telemetry.game.on("refuel-paid",  spies.refuelPaid)

    game(telemetry, data)

    data[0].game.paused            = true
    data[0].game.time             += 10
    data[0].events.fine.active     = true
    data[0].events.tollgate.active = true
    data[0].events.ferry.active    = true
    data[0].events.train.active    = true
    game(telemetry, data)

    data[0].game.paused            = false
    data[1].game.time++
    data[0].events.fine.active     = false
    data[0].events.tollgate.active = false
    data[0].events.ferry.active    = false
    data[0].events.train.active    = false
    game(telemetry, data)

    data[1].game.paused            = true
    data[1].game.time             += 9
    data[1].events.fine.active     = true
    data[1].events.tollgate.active = true
    data[1].events.ferry.active    = true
    data[1].events.train.active    = true
    game(telemetry, data)

    data[1].game.paused            = false
    data[1].game.time             -= 5
    data[1].events.fine.active     = false
    data[1].events.tollgate.active = false
    data[1].events.ferry.active    = false
    data[1].events.train.active    = false
    game(telemetry, data)
  })

  it("Should emit pause events", function() {
    assert.equal(spies.pause.args.length, 2)
    assert.equal(spies.pause.args[0][0], true)
    assert.equal(spies.pause.args[1][0], false)
  })
  
  it("Should emit time-change events", function() {
    assert.equal(spies.timeChange.args.length, 3)
    assert.deepEqual(spies.timeChange.args[0], [110, 100])
    assert.deepEqual(spies.timeChange.args[1], [110, 101])
    assert.deepEqual(spies.timeChange.args[2], [110, 105])
  })
  
  it("Should emit fine events", function() {
    assert.equal(spies.fine.args.length, 1)
    assert.deepEqual(spies.fine.args[0][0], {offence: "foobar", amount: 100})
  })
  
  it("Should emit tollgate events", function() {
    assert.equal(spies.tollgate.args.length, 1)
    assert.deepEqual(spies.tollgate.args[0][0], {amount: 200})
  })
  
  it("Should emit ferry events", function() {
    assert.equal(spies.ferry.args.length, 1)
    assert.deepEqual(spies.ferry.args[0][0], {
      source:      "foo",
      destination: "bar",
      target:      "bar",
      amount:      300,
    })
  })

  it("Should emit train events", function() {
    assert.equal(spies.train.args.length, 1)
    assert.deepEqual(spies.train.args[0][0], {
      source:      "foo",
      destination: "bar",
      target:      "bar",
      amount:      400,
    })
  })

  it("Should emit refuel-paid events", function() {
    const data = [createData(), createData()]

    game(telemetry, data)
    data[0].events.refuelPaid.active = true
    data[0].events.refuelPaid.amount = 600
    game(telemetry, data)
  
    assert.deepEqual(spies.refuelPaid.args[0], [
      {amount: 600}
    ])
  })

})