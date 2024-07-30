// app.js
$(document).ready(function () {
    const elevators = [
        { id: 'elevator1', floor: 0, busy: false },
        { id: 'elevator2', floor: 0, busy: false },
        { id: 'elevator3', floor: 0, busy: false },
        { id: 'elevator4', floor: 0, busy: false },
        { id: 'elevator5', floor: 0, busy: false }
    ];

    const elevatorQueue = [];

    $('.call-btn').on('click', function () {
        const floor = $(this).parent().data('floor');
        $(this).addClass('waiting').text('Waiting');
        elevatorQueue.push(floor);
        processQueue();
    });

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

        elevators.forEach(elevator => {
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
        const travelTime = distance * 1000; // Assuming 1s per floor

        $elevator.addClass('moving').css('bottom', `${targetFloor * 50}px`);
        setTimeout(() => {
            elevator.floor = targetFloor;
            $elevator.removeClass('moving').addClass('red');
            setTimeout(() => {
                makeSound();
                $elevator.removeClass('red').addClass('green');
                setTimeout(() => {
                    $elevator.removeClass('green').css('background-color', 'black');
                    $(`.floor[data-floor="${targetFloor}"] .call-btn`).removeClass('waiting').text('Arrived');
                    setTimeout(() => {
                        $(`.floor[data-floor="${targetFloor}"] .call-btn`).text('Call');
                        elevator.busy = false;
                        processQueue();
                    }, 2000);
                }, 2000);
            }, 1000);
        }, travelTime);
    }

    function makeSound() {
        const audio = new Audio('ding.mp3');
        audio.play();
    }
});
