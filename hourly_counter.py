#!/usr/bin/env python3
"""
Hourly Counter - adds $26.24 to total every hour with audible alert each cycle.
Commands: start | stop | status | reset | quit
"""

import os
import sys
import time
import threading
from datetime import datetime, timedelta

HOURLY_AMOUNT = 26.24


class HourlyCounter:
    def __init__(self):
        self.total = 0.0
        self.running = False
        self._thread = None
        self._next_alert = None

    def _beep(self):
        # Terminal bell (works in most terminals)
        print("\a", end="", flush=True)
        if sys.platform == "win32":
            try:
                import winsound
                for _ in range(3):
                    winsound.Beep(880, 300)
                    time.sleep(0.15)
            except Exception:
                pass
        elif sys.platform == "darwin":
            os.system("afplay /System/Library/Sounds/Glass.aiff 2>/dev/null")
        else:
            # Linux: try paplay, then beep, then silent terminal bell already sent
            os.system(
                "paplay /usr/share/sounds/freedesktop/stereo/complete.oga 2>/dev/null"
                " || beep -f 880 -l 500 2>/dev/null"
            )

    def _run(self):
        self._next_alert = datetime.now() + timedelta(hours=1)
        while self.running:
            if datetime.now() >= self._next_alert:
                self.total += HOURLY_AMOUNT
                self._beep()
                print(
                    f"\n  *** HOUR COMPLETE ***  +${HOURLY_AMOUNT:.2f} added"
                    f"  |  Total: ${self.total:.2f}\n> ",
                    end="",
                    flush=True,
                )
                self._next_alert += timedelta(hours=1)
            time.sleep(1)

    def start(self):
        if self.running:
            print("  Already running.")
            return
        self.running = True
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        print(f"  Counter started — ${HOURLY_AMOUNT:.2f} added every hour.")

    def stop(self):
        if not self.running:
            print("  Counter is not running.")
            return
        self.running = False
        self._next_alert = None
        print(f"  Counter stopped.  Total: ${self.total:.2f}")

    def status(self):
        state = "RUNNING" if self.running else "STOPPED"
        print(f"  Status : {state}")
        print(f"  Total  : ${self.total:.2f}")
        if self.running and self._next_alert:
            secs_left = max(0, int((self._next_alert - datetime.now()).total_seconds()))
            m, s = divmod(secs_left, 60)
            print(f"  Next +${HOURLY_AMOUNT:.2f} in: {m:02d}m {s:02d}s")

    def reset(self):
        if self.running:
            print("  Stop the counter before resetting.")
            return
        self.total = 0.0
        print("  Total reset to $0.00")


def main():
    counter = HourlyCounter()

    print("\n" + "=" * 46)
    print("    HOURLY COUNTER  |  $26.24 per hour")
    print("=" * 46)
    print("  start  — start the counter")
    print("  stop   — stop the counter")
    print("  status — show total & countdown to next add")
    print("  reset  — reset total to $0.00 (when stopped)")
    print("  quit   — exit")
    print("=" * 46 + "\n")

    while True:
        try:
            cmd = input("> ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print()
            counter.stop()
            print("  Goodbye!")
            break

        if cmd == "start":
            counter.start()
        elif cmd == "stop":
            counter.stop()
        elif cmd in ("status", "s", ""):
            counter.status()
        elif cmd == "reset":
            counter.reset()
        elif cmd in ("quit", "exit", "q"):
            counter.stop()
            print("  Goodbye!")
            break
        else:
            print("  Commands: start | stop | status | reset | quit")


if __name__ == "__main__":
    main()
