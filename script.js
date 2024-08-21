$(document).ready(function () {
  const elevators = [
    {
      id: "elevator1",
      floor: 0,
      busy: false,
      moving: false,
      targetFloor: null,
      startTime: null,
      travelTime: null,
      startBottom: 0,
    },
    {
      id: "elevator2",
      floor: 0,
      busy: false,
      moving: false,
      targetFloor: null,
      startTime: null,
      travelTime: null,
      startBottom: 0,
    },
    {
      id: "elevator3",
      floor: 0,
      busy: false,
      moving: false,
      targetFloor: null,
      startTime: null,
      travelTime: null,
      startBottom: 0,
    },
    {
      id: "elevator4",
      floor: 0,
      busy: false,
      moving: false,
      targetFloor: null,
      startTime: null,
      travelTime: null,
      startBottom: 0,
    },
    {
      id: "elevator5",
      floor: 0,
      busy: false,
      moving: false,
      targetFloor: null,
      startTime: null,
      travelTime: null,
      startBottom: 0,
    },
  ];

  const elevatorQueue = [];
  const waitingTimes = {};
  const canceledFloors = new Set();

  elevators.forEach((elevator, index) => {
    $(`#${elevator.id}`).css("--elevator-index", index + 1);
  });

  $(".call-btn").on("click", function () {
    const floor = $(this).data("floor");
    const $btn = $(this);

    if ($btn.hasClass("waiting")) {
      console.log(`Canceling elevator call to floor ${floor}`);
      cancelElevatorCall(floor);
      return;
    }

    console.log(`Requesting elevator to floor ${floor}`);
    canceledFloors.delete(floor);

    $btn.addClass("waiting").text("Waiting");

    if (!waitingTimes[floor]) {
      waitingTimes[floor] = {
        startTime: new Date(),
        element: $btn,
        interval: setInterval(() => updateWaitingTimes(floor), 1000),
      };
    } else {
      waitingTimes[floor].startTime = new Date();
    }

    updateWaitingTimes(floor);
    elevatorQueue.push(floor);
    console.log(`Queue after adding floor ${floor}: `, elevatorQueue);
    processQueue();
  });

  function updateWaitingTimes(floor) {
    const waitTime = waitingTimes[floor];
    const elapsed = Math.floor((new Date() - waitTime.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    waitTime.element.siblings(".waiting-time").remove();
    waitTime.element.after(
      `<span class="waiting-time">Waiting: ${minutes} min ${seconds} sec</span>`
    );
  }

  function processQueue() {
    if (elevatorQueue.length > 0) {
      const targetFloor = elevatorQueue.shift();
      console.log(`Processing queue, target floor: ${targetFloor}`);

      if (canceledFloors.has(targetFloor)) {
        console.log(`Call to floor ${targetFloor} was canceled, skipping.`);
        return;
      }

      const closestElevator = findClosestElevator(targetFloor);
      if (closestElevator) {
        console.log(`Closest elevator found: ${closestElevator.id}`);
        closestElevator.targetFloor = targetFloor;
        moveToFloor(closestElevator, targetFloor);
      } else {
        console.log(
          `No available elevators, pushing ${targetFloor} back to the queue`
        );
        elevatorQueue.unshift(targetFloor);
      }
    }
  }

  function findClosestElevator(targetFloor) {
    let closestElevator = null;
    let minDistance = Infinity;
    elevators.forEach((elevator) => {
      if (!elevator.busy && !canceledFloors.has(elevator.targetFloor)) {
        const distance = Math.abs(elevator.floor - targetFloor);
        if (distance < minDistance) {
          minDistance = distance;
          closestElevator = elevator;
        }
      }
    });
    console.log(
      `Closest elevator to floor ${targetFloor} is ${
        closestElevator ? closestElevator.id : "none"
      }`
    );
    return closestElevator;
  }

  function moveToFloor(elevator, targetFloor) {
    console.log(`Moving elevator ${elevator.id} to floor ${targetFloor}`);
    elevator.busy = true;
    elevator.moving = true;
    elevator.startTime = new Date();
    const $elevator = $(`#${elevator.id}`);
    const distance = Math.abs(elevator.floor - targetFloor);
    elevator.travelTime = distance * 1000;
    elevator.startBottom = parseInt($elevator.css("bottom"), 10);

    $elevator.css("transition", `bottom ${elevator.travelTime / 1000}s linear`);
    $elevator.addClass("moving").css("bottom", `${targetFloor * 55}px`);

    const moveTimeout = setTimeout(() => {
      if (
        canceledFloors.has(targetFloor) ||
        elevator.targetFloor !== targetFloor
      ) {
        console.log(
          `Movement to floor ${targetFloor} canceled for elevator ${elevator.id}`
        );
        elevator.moving = false;
        elevator.busy = false;
        elevator.targetFloor = null;
        processQueue();
        return;
      }

      console.log(`Elevator ${elevator.id} arrived at floor ${targetFloor}`);
      elevator.floor = targetFloor;
      $elevator.removeClass("moving").addClass("arrived");
      makeSound();

      setTimeout(() => {
        $elevator.removeClass("arrived").addClass("finished");
        const $btn = $(`#call-buttons .call-btn[data-floor="${targetFloor}"]`);
        $btn.removeClass("waiting").addClass("arrived").text("Arrived");

        if (waitingTimes[targetFloor]) {
          clearInterval(waitingTimes[targetFloor].interval);
          waitingTimes[targetFloor].element.siblings(".waiting-time").remove();
          delete waitingTimes[targetFloor];
        }

        setTimeout(() => {
          console.log(
            `Elevator ${elevator.id} finished at floor ${targetFloor}`
          );
          $btn.text("Call").removeClass("arrived");
          $elevator.removeClass("finished waiting").css({
            fill: "",
            transition: "bottom 1s linear",
          });
          elevator.busy = false;
          elevator.moving = false;
          elevator.targetFloor = null;
          processQueue();
        }, 2000);
      }, 2000);
    }, elevator.travelTime);

    elevator.moveTimeout = moveTimeout; // Save the timeout reference
  }

  function cancelElevatorCall(floor) {
    console.log(`Canceling elevator request to floor ${floor}`);
    canceledFloors.add(floor);

    const queueIndex = elevatorQueue.indexOf(floor);
    if (queueIndex > -1) {
      console.log(`Removing floor ${floor} from queue`);
      elevatorQueue.splice(queueIndex, 1);
    }

    elevators.forEach((elevator) => {
      if (elevator.targetFloor === floor && elevator.moving) {
        console.log(
          `Stopping elevator ${elevator.id} moving to floor ${floor}`
        );

        const elapsedTime = new Date() - elevator.startTime;
        const travelRatio = elapsedTime / elevator.travelTime;
        const currentBottom =
          elevator.startBottom +
          travelRatio * (floor * 55 - elevator.startBottom);

        // Determine the nearest floor based on direction
        const currentFloorPosition = currentBottom / 55;
        let nearestFloor;
        if (floor > elevator.floor) {
          nearestFloor = Math.ceil(currentFloorPosition); // Moving up
        } else {
          nearestFloor = Math.floor(currentFloorPosition); // Moving down
        }

        console.log(
          `Stopping elevator ${elevator.id} at nearest floor: ${nearestFloor}`
        );

        // Calculate the remaining distance to the nearest floor
        const remainingDistance = Math.abs(currentBottom - nearestFloor * 55);
        const remainingTime = (remainingDistance / 55) * 1000; // Assuming 1 second per floor

        // Stop the elevator at the nearest floor with a smooth transition
        elevator.targetFloor = nearestFloor;
        elevator.moving = false;
        elevator.busy = false;
        elevator.floor = nearestFloor;

        const $elevator = $(`#${elevator.id}`);
        $elevator
          .css("transition", `bottom ${remainingTime / 1000}s linear`)
          .css("bottom", `${nearestFloor * 55}px`);
        $elevator.removeClass("moving");

        // Cancel the timeout to stop the elevator from completing its move
        clearTimeout(elevator.moveTimeout);
      }
    });

    const $btn = $(`#call-buttons .call-btn[data-floor="${floor}"]`);
    if (waitingTimes[floor]) {
      clearInterval(waitingTimes[floor].interval);
      waitingTimes[floor].element.siblings(".waiting-time").remove();
      delete waitingTimes[floor];
    }

    $btn.removeClass("waiting").text("Call");
    console.log(`Elevator call to floor ${floor} canceled and button reset`);
  }

  function makeSound() {
    const audio = new Audio("ding.mp3");
    audio.play();
  }
});
