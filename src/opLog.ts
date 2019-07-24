export class OperationLog<State extends ReadonlyState, ReadonlyState, Operation> {
    private log: Operation[] = []
    private cursor: number = -1
    private currState: State;
    private changeListeners: ((newState?: State) => void)[] = [];

    constructor(private newState: () => State, private applyOperation: (old: State, op: Operation) => State) {
        this.currState = newState()
    }

    private truncate() {
        // DESTRUCTIVE
        if (this.cursor < this.log.length)
            this.log.splice(this.cursor + 1)
    }
    private lastIdx(): number {
        return this.log.length - 1
    }
    private currentOp(): Operation | null {
        if (0 <= this.cursor && this.cursor < this.log.length)
            return this.log[this.cursor]
        else
            return null
    }

    private onChange() {
        if (this.changeListeners)
            this.changeListeners.forEach(e => e(this.currState));
    }

    addChangeListener(cb: () => void) {
        this.changeListeners.push(cb);
    }

    currentState(): ReadonlyState {
        return this.currState
    }

    do(op: Operation) {
        // if we're not at the end of the log, truncate the rest
        if (this.cursor < this.lastIdx()) {
            this.truncate()
        }
        this.log.push(op)
        this.cursor = this.lastIdx()

        this.currState = this.applyOperation(this.currState, op)

        this.onChange()
    }

    undo(): void {
        if (this.cursor >= 0)
            this.cursor--

        // TODO(dz): incremental undo
        let newState = this.computeState(this.applyOperation, this.newState());
        this.currState = newState

        this.onChange()
    }

    redo(): void {
        if (this.cursor < this.lastIdx())
            this.cursor++

        let op = this.currentOp()
        this.currState = this.applyOperation(this.currState, op)

        this.onChange()
    }

    private computeState(reduceFn: (prevState: State, nextOp: Operation) => State, defState: State): State {
        return this.log.slice(0, this.cursor + 1).reduce(reduceFn, defState)
    }
}