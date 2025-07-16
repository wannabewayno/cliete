export const timePlural = <const T>(currentTime: number, done: (finalAmount: number) => T) => {
  const multiplyAmount = (accumulator: number) => accumulator * currentTime;

  return {
    get milliseconds() {
      const timeToWait = multiplyAmount(1);
      return done(timeToWait);
    },
    get seconds() {
      const timeToWait = multiplyAmount(1000);
      return done(timeToWait);
    },
    get minutes() {
      const timeToWait = multiplyAmount(1000 * 60);
      return done(timeToWait);
    },
    get hours() {
      const timeToWait = multiplyAmount(1000 * 60 * 60);
      return done(timeToWait);
    },
  };
};

export const adders = <const T>(baseAmount: number, done: (finalAmount: number) => T) => {
  const addAmount = (accumulator: number) => accumulator + baseAmount;

  return {
    get one() {
      return done(addAmount(1));
    },
    get two() {
      return done(addAmount(2));
    },
    get three() {
      return done(addAmount(3));
    },
    get four() {
      return done(addAmount(4));
    },
    get five() {
      return done(addAmount(5));
    },
    get six() {
      return done(addAmount(6));
    },
    get seven() {
      return done(addAmount(7));
    },
    get eight() {
      return done(addAmount(8));
    },
    get nine() {
      return done(addAmount(9));
    },
  };
};

export const time = <const T>(amount: number, done: (milliseconds: number) => T) => {
  const multiplierCb = (accumulator: number) => {
    const multiplyAmount = (_accumulator: number) => _accumulator * accumulator * amount;
    return {
      get and() {
        return adders(accumulator, (amount: number) => timePlural(amount, done));
      },
      get milliseconds() {
        const timeToWait = multiplyAmount(1);
        return done(timeToWait);
      },
      get seconds() {
        const timeToWait = multiplyAmount(1000);
        return done(timeToWait);
      },
      get minutes() {
        const timeToWait = multiplyAmount(1000 * 60);
        return done(timeToWait);
      },
      get hours() {
        const timeToWait = multiplyAmount(1000 * 60 * 60);
        return done(timeToWait);
      },
    };
  };

  return {
    get milliseconds() {
      return done(amount * 1);
    },
    get seconds() {
      return done(amount * 1000);
    },
    get minutes() {
      return done(amount * 1000 * 60);
    },
    get hours() {
      return done(amount * 1000 * 60 * 60);
    },
    get hundred() {
      return multiplierCb(100);
    },
    get thousand() {
      return multiplierCb(1_000);
    },
  };
};

export const timeWithSingular = <const T>(done: (milliseconds: number) => T) => {
  const multiplierCb = (accumulator: number) => {
    const multiplyAmount = (_accumulator: number) => _accumulator * accumulator;
    return {
      get and() {
        return adders(accumulator, (amount: number) => timePlural(amount, done));
      },
      get milliseconds() {
        const timeToWait = multiplyAmount(1);
        return done(timeToWait);
      },
      get seconds() {
        const timeToWait = multiplyAmount(1000);
        return done(timeToWait);
      },
      get minutes() {
        const timeToWait = multiplyAmount(1000 * 60);
        return done(timeToWait);
      },
      get hours() {
        const timeToWait = multiplyAmount(1000 * 60 * 60);
        return done(timeToWait);
      },
    };
  };

  return {
    get millisecond() {
      return done(1);
    },
    get second() {
      return done(1000);
    },
    get minute() {
      return done(1000 * 60);
    },
    get hour() {
      return done(1000 * 60 * 60);
    },
    get hundred() {
      return multiplierCb(100);
    },
    get thousand() {
      return multiplierCb(1_000);
    },
  };
};

export const sleep = (timeout: number) => new Promise<void>(resolve => setTimeout(() => resolve(), timeout));

export const timeout = <T>(promise: Promise<T>, errMsg: string | (() => string), timeout: number | null = 6000) => {
  const timeoutError = new Promise<Error>(resolve => {
    if (timeout !== null && timeout > 0) {
      setTimeout(() => {
        const message = errMsg instanceof Function ? errMsg() : errMsg;
        resolve(new Error(`Timeout of ${timeout}ms reached waiting ${message}`));
      }, timeout);
    }
  });

  return Promise.race([timeoutError, promise]).then(value => {
    if (value instanceof Error) throw value;
    return value;
  });
};

// biome-ignore lint/suspicious/noExplicitAny: any is fine here as it's literally anything as long as it maps to PromiseHandler
export const waitFor = <const The, const PromiseHandler extends (promise: Promise<unknown>) => any>(opts: {
  the: The;
  and: PromiseHandler;
}) => {
  const done = (milliseconds: number): { and: ReturnType<PromiseHandler> } => {
    const sleep = new Promise<void>(resolve => setTimeout(() => resolve(), milliseconds));

    // Forward the timeout promise onto the handler and let the user choose an action or assertion to continue.
    return {
      get and() {
        return opts.and(sleep);
      },
    };
  };

  return {
    get the() {
      return opts.the;
    },
    // ----
    get one() {
      return timeWithSingular(done);
    },
    get two() {
      return time(2, done);
    },
    get three() {
      return time(3, done);
    },
    get four() {
      return time(4, done);
    },
    get five() {
      return time(5, done);
    },
    get six() {
      return time(6, done);
    },
    get seven() {
      return time(7, done);
    },
    get eight() {
      return time(8, done);
    },
    get nine() {
      return time(9, done);
    },
    // ----
    get ten() {
      return time(10, done);
    },
    get eleven() {
      return time(11, done);
    },
    get twelve() {
      return time(12, done);
    },
    get thirteen() {
      return time(13, done);
    },
    get fourteen() {
      return time(14, done);
    },
    get fifteen() {
      return time(15, done);
    },
    get sixteen() {
      return time(16, done);
    },
    get seventeen() {
      return time(17, done);
    },
    get eighteen() {
      return time(18, done);
    },
    get nineteen() {
      return time(19, done);
    },
    // ----
    get twenty() {
      return adders(20, (amount: number) => time(amount, done));
    },
    get thirty() {
      return adders(30, (amount: number) => time(amount, done));
    },
    get fourty() {
      return adders(40, (amount: number) => time(amount, done));
    },
    get fifty() {
      return adders(50, (amount: number) => time(amount, done));
    },
    get sixty() {
      return adders(60, (amount: number) => time(amount, done));
    },
    get seventy() {
      return adders(70, (amount: number) => time(amount, done));
    },
    get eighty() {
      return adders(80, (amount: number) => time(amount, done));
    },
    get ninety() {
      return adders(90, (amount: number) => time(amount, done));
    },
  };
};
