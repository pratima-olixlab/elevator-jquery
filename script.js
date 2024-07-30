$(document).ready(function () {
  const elevators = [
    { id: "elevator1", floor: 0, busy: false },
    { id: "elevator2", floor: 0, busy: false },
    { id: "elevator3", floor: 0, busy: false },
    { id: "elevator4", floor: 0, busy: false },
    { id: "elevator5", floor: 0, busy: false },
  ];
  const elevatorQueue = [];
  const waitingTimes = {};
  elevators.forEach((elevator, index) => {
    $(`#${elevator.id}`).css("--elevator-index", index + 1);
  });
  $(".call-btn").on("click", function () {
    const floor = $(this).data("floor");
    const $btn = $(this);
    if ($btn.hasClass("waiting")) {
      return;
    }
    $btn.addClass("waiting").text("Waiting").prop("disabled", true);
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
      const closestElevator = findClosestElevator(targetFloor);
      if (closestElevator) {
        moveToFloor(closestElevator, targetFloor);
      } else {
        elevatorQueue.unshift(targetFloor);
      }
    }
  }
  function findClosestElevator(targetFloor) {
    let closestElevator = null;
    let minDistance = Infinity;
    elevators.forEach((elevator) => {
      if (!elevator.busy) {
        const distance = Math.abs(elevator.floor - targetFloor);
        if (distance < minDistance) {
          minDistance = distance;
          closestElevator = elevator;
        }
      }
    });
    return closestElevator;
  }
  function moveToFloor(elevator, targetFloor) {
    elevator.busy = true;
    const $elevator = $(`#${elevator.id}`);
    const distance = Math.abs(elevator.floor - targetFloor);
    const travelTime = distance * 1000;
    $elevator.css("transition", `bottom ${travelTime / 1000}s linear`);
    $elevator.addClass("moving").css("bottom", `${targetFloor * 55}px`);
    setTimeout(() => {
      elevator.floor = targetFloor;
      $elevator.removeClass("moving").addClass("arrived");
      makeSound();
      setTimeout(() => {
        $elevator.removeClass("arrived").addClass("finished");
        const $btn = $(`#call-buttons .call-btn[data-floor="${targetFloor}"]`);
        $btn
          .removeClass("waiting")
          .addClass("arrived")
          .text("Arrived")
          .prop("disabled", false);
        if (waitingTimes[targetFloor]) {
          clearInterval(waitingTimes[targetFloor].interval);
          waitingTimes[targetFloor].element.siblings(".waiting-time").remove();
          delete waitingTimes[targetFloor];
        }
        setTimeout(() => {
          $btn.text("Call").removeClass("arrived");
          $elevator.removeClass("finished waiting").css({
            fill: "",
            transition: "bottom 1s linear",
          });
          elevator.busy = false;
          processQueue();
        }, 2000);
      }, 2000);
    }, travelTime);
  }
  function makeSound() {
    const audio = new Audio("ding.mp3");
    audio.play();
  }
});
