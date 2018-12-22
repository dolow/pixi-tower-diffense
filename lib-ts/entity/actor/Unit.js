import UnitState from '../../enum/UnitState';
var INVALID_ID = -1;
var UnitManager = /** @class */ (function () {
    function UnitManager() {
        this.units = [];
    }
    UnitManager.prototype.update = function (delta) {
        for (var i = 0; i < units.length; i++) {
            var unit = units[i];
            switch (unit.state) {
                case UnitState.IDLE:
                    this.updateIdle(unit, delta);
                    break;
                case UnitState.LOCKED:
                    this.updateLocked(unit, delta);
                    break;
                case UnitState.DEAD:
                    this.updateDead(unit, delta);
                    break;
                default: break;
            }
            this.updateState(unit);
        }
    };
    UnitManager.prototype.updateState = function () {
        // any -> dead
        if (this.health <= 0) {
            this.state = UnitState.DEAD;
            return;
        }
        // idle -> lock
        // lock -> idle
    };
    UnitManager.prototype.updateIdle = function (unit, delta) {
        unit.container.position.x += unit.speed * delta;
    };
    UnitManager.prototype.updateLocked = function (unit, delta) {
        if (unit.wieldFrames > unit.currentWieldFrame) {
            unit.currentWieldFrame = 0;
        }
        if (unit.currentWieldFrame === unit.hitFrame) {
            this.units[unit.engagedEnemyIndex].health -= unit.power;
        }
        unit.currentWieldFrame++;
    };
    UnitManager.prototype.updateDead = function (unit, delta) {
    };
    return UnitManager;
}());
var Unit = /** @class */ (function () {
    function Unit() {
        this.unitId = 0;
        this.health = 0;
        this.power = 0;
        this.speed = 0;
        this.wieldFrames = 0;
        this.hitFrame = 0;
        this.state = 0;
        this.currentWieldFrame = 0;
        this.engagedEnemyIndex = 0;
        this.container = [];
    }
    Unit.prototype.isDestroyed = function (index) {
        return this.id === INVALID_ID;
    };
    Unit.prototype.destroy = function (index) {
        this.id = INVALID_ID;
    };
    Unit.prototype.update = function (delta) {
        switch (this.state) {
            case UnitState.IDLE:
                this.updateIdle(i, delta);
                break;
            case UnitState.LOCKED:
                this.updateLocked(i, delta);
                break;
            case UnitState.DEAD:
                this.updateDead(i, delta);
                break;
            default: break;
        }
        this.updateState(i);
    };
    Unit.prototype.updateState = function () {
        // dead
        if (this.health <= 0) {
            this.state = UnitState.DEAD;
            return;
        }
        // locked
    };
    Unit.prototype.updateIdle = function (delta) {
        this.container.position.x += this.speed * delta;
    };
    Unit.prototype.updateLocked = function (delta) {
    };
    Unit.prototype.updateDead = function (delta) {
    };
    return Unit;
}());
export default Unit;
//# sourceMappingURL=Unit.js.map