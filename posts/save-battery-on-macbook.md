---
title: "Save Battery Life on a MacBook"
date: 2026-08-13
tags:
  - tool usage
  - laptop
  - operating system
---

# Save Battery Life on a MacBook

I have been using a MacBook Pro with an M5 Pro chip for about two months.
One issue that has bothered me is that the MacBook sometimes becomes unusually hot while the lid is closed and the system is asleep.

I found that the macOS can periodically wake the system while it is sleeping.

My solution is to turn off the Wi-Fi and Bluetooth before the Mac goes to sleep on battery power.
I also disabled Power Nap with the following command:

```bash
sudo pmset -b powernap 0
```

I installed `sleepwatcher` and `bluetil` on the machine. 
`sleepwatcher` provides a daemon that runs custom `~/.wakeup` and `~/.sleep` script when the system wakes up and goes to sleep, respectively.
`bluetil` allows the scripts to control Bluetooth from the command line.

After installing `sleepwatcher` with Homebrew and starting its background service, I created the following `~/.wakeup` and `~/.sleep` scripts.

::: warning
Using these scripts will effectively disable Find My.
:::

```bash
# wakeup
#!/bin/sh
STATE="$HOME/.sleepwatcher-radios-off"
# Only restore radios if SleepWatcher disabled them before sleep.
if [ -f "$STATE" ]; then
    /opt/homebrew/bin/blueutil -p 1
    /usr/sbin/networksetup -setairportpower Wi-Fi on

    /bin/rm -f "$STATE"
fi
```

```bash
# sleep
#!/bin/sh
STATE="$HOME/.sleepwatcher-radios-off"
# Only do anything if currently running on battery.
if /usr/bin/pmset -g batt | /usr/bin/grep -q "Battery Power"; then
    /opt/homebrew/bin/blueutil -p 0
    /usr/sbin/networksetup -setairportpower Wi-Fi off

    /usr/bin/touch "$STATE"
fi
```

Both scripts must be executable.

Before the Mac goes to sleep, the sleep script checks whether it is running on battery power.
If it is, the script disables Wi-Fi and Bluetooth and creates a state file. 
When the Mac wakes
up, the wake-up script checks for that file, restores both radios, and then removes the file.
If the Mac goes to sleep while connected to power, the scripts leave Wi-Fi and Bluetooth
unchanged.