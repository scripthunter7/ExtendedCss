import { Context } from '..';

import utils from '../utils';

const isSupported = (typeof window.requestAnimationFrame !== 'undefined');
const rAF = isSupported ? requestAnimationFrame : window.setTimeout;
const perf = isSupported ? performance : Date;

type WrappedCallback = (timestamp: number) => void;

type ApplyRulesCallback = (context: Context) => void;

export class AsyncWrapper {
    private context: Context;

    private callback: ApplyRulesCallback;

    // number, the provided callback should be executed twice in this time frame
    private throttle: number;

    private wrappedCb: WrappedCallback;

    private rAFid?: number;

    private timerId?: number;

    private lastRun?: number;

    constructor(context: Context, callback: ApplyRulesCallback, throttle: number) {
        this.context = context;
        this.callback = callback;
        this.throttle = throttle;
        this.wrappedCb = this.wrappedCallback.bind(this);
    }

    private wrappedCallback(timestamp?: number): void {
        this.lastRun = utils.isNumber(timestamp) ? timestamp : perf.now();
        delete this.rAFid;
        delete this.timerId;
        this.callback(this.context);
    }

    /**
     * Indicates whether there is a scheduled callback.
     */
    private hasPendingCallback(): boolean {
        return utils.isNumber(this.rAFid) || utils.isNumber(this.timerId);
    }

    /**
     * Schedules a function call before the next animation frame.
     */
    run(): void {
        if (this.hasPendingCallback()) {
            // there is a pending execution scheduled
            return;
        }
        if (typeof this.lastRun !== 'undefined') {
            const elapsed = perf.now() - this.lastRun;
            if (elapsed < this.throttle) {
                this.timerId = window.setTimeout(this.wrappedCb, this.throttle - elapsed);
                return;
            }
        }
        this.rAFid = rAF(this.wrappedCb);
    }

    // TODO: later
    // now(): number {
    //     return perf.now();
    // };
}
