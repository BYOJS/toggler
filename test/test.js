// note: this module specifier comes from the import-map
//    in index.html; swap "src" for "dist" here to test
//    against the dist/* files
import Toggler from "toggler/src";


// ***********************

var testResultsEl;

if (document.readyState == "loading") {
	document.addEventListener("DOMContentLoaded",ready,false);
}
else {
	ready();
}


// ***********************

async function ready() {
	var runTestsBtn = document.getElementById("run-tests-btn");
	testResultsEl = document.getElementById("test-results");

	runTestsBtn.addEventListener("click",runTests,false);
}

async function runTests() {
	var results = [];
	var expected = [
		"one",
		"two",
		"two",
		"one",
		"one",
		"two",
	];
	testResultsEl.innerHTML = "Running... please wait.";

	try {
		let toggle = Toggler(150,300);

		toggle(one,two);
		await timeout(175);
		toggle(one,two);
		await timeout(325);
		toggle(one,two);
		toggle(one,two);
		await timeout(325);
		toggle(one,two);
		toggle(one,two);
		toggle(one,two);
		await timeout(175);
		toggle(one,two);
		await timeout(50);
		toggle(one,two);
		await timeout(50);
		toggle(one,two);
		await timeout(50);
		toggle(one,two);
		await timeout(175);
		toggle(one,two);
		await timeout(50);
		toggle(one,two);
		await timeout(50);
		toggle(one,two);
		await timeout(325);

		if (JSON.stringify(results) == JSON.stringify(expected)) {
			testResultsEl.innerHTML = "PASSED.";
		}
		else {
			testResultsEl.innerHTML = `FAILED: expected '${expected.join(",")}', found '${results.join(",")}'`;
		}
	}
	catch (err) {
		logError(err);
		testResultsEl.innerHTML = "FAILED (see console)";
	}

	// ****************

	function one() {
		results.push("one");
	}

	function two() {
		results.push("two");
	}
}

function timeout(ms) {
	return new Promise(res => setTimeout(res,ms));
}

function logError(err,returnLog = false) {
	var err = `${
			err.stack ? err.stack : err.toString()
		}${
			err.cause ? `\n${logError(err.cause,/*returnLog=*/true)}` : ""
	}`;
	if (returnLog) return err;
	else console.error(err);
}
