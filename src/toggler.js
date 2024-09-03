import Scheduler from "@byojs/scheduler";


// ***********************

export default Toggler;


// ***********************

function Toggler(taskOneDelay,taskTwoDelay) {
	var mostRecentlyScheduled = new WeakSet();
	var activators = new WeakMap();
	var cancellers = new WeakMap();
	var taskOneScheduler = Scheduler(
		Number(taskOneDelay ?? 100),
		undefined,
		/*leading=*/false
	);
	var taskTwoScheduler = Scheduler(
		Number(taskTwoDelay ?? 100),
		undefined,
		/*leading=*/false
	);

	return schedule;


	// ***********************

	function schedule(fnOne,fnTwo) {
		// only register these (stable) wrappers the
		// first time
		if (!activators.has(fnOne)) {
			activators.set(fnOne,() => {
				cancellers.delete(fnOne);
				fnOne();
			});
		}
		if (!activators.has(fnTwo)) {
			activators.set(fnTwo,() => {
				cancellers.delete(fnTwo);
				fnTwo();
			});
		}

		// task one most recently scheduled?
		if (mostRecentlyScheduled.has(fnOne)) {
			scheduleTaskTwo(fnOne,fnTwo);
		}
		else {
			scheduleTaskOne(fnOne,fnTwo);
		}
	}

	function scheduleTaskOne(fnOne,fnTwo) {
		// toggle which task was most recently
		// scheduled
		mostRecentlyScheduled.delete(fnTwo);
		mostRecentlyScheduled.add(fnOne);

		// need to deactivate previous task
		// first?
		if (cancellers.has(fnTwo)) {
			cancellers.get(fnTwo)();
			cancellers.delete(fnTwo);
		}

		// save canceller (comes back from
		// scheduler)
		cancellers.set(fnOne,
			// schedule fnOne()
			taskOneScheduler(
				activators.get(fnOne)
			)
		);
	}

	function scheduleTaskTwo(fnOne,fnTwo) {
		// toggle which task was most recently
		// scheduled
		mostRecentlyScheduled.delete(fnOne);
		mostRecentlyScheduled.add(fnTwo);

		// need to deactivate previous task
		// first?
		if (cancellers.has(fnOne)) {
			cancellers.get(fnOne)();
			cancellers.delete(fnOne);
		}

		// save canceller (comes back from
		// scheduler)
		cancellers.set(fnTwo,
			// schedule fnTwo()
			taskTwoScheduler(
				activators.get(fnTwo)
			)
		);
	}
}
