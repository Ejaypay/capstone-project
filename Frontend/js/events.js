const events = [
  {
    id: 1,
    title: "Friday Build Night",
    day: "7",
    month: "Mar",
    location: "Baguio Gunpla Station",
    time: "6:00 PM - 9:00 PM",
    type: "Build Night",
    description:
      "Bring your kit and build with fellow hobbyists. Free workspace and tools provided."
  },
  {
    id: 2,
    title: "Friday Build Night",
    day: "7",
    month: "Mar",
    location: "Mecha Corner Baguio",
    time: "5:00 PM - 8:00 PM",
    type: "Workshop",
    description:
      "Bring your kit and build with fellow hobbyists. Free workspace and tools provided."
  },
  {
    id: 3,
    title: "Friday Build Night",
    day: "7",
    month: "Mar",
    location: "Runner Gate Hobby",
    time: "4:00 PM - 7:00 PM",
    type: "Community Event",
    description:
      "Bring your kit and build with fellow hobbyists. Free workspace and tools provided."
  }
];

const eventsList = document.getElementById("eventsList");
const eventModal = document.getElementById("eventModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const buyerBtn = document.getElementById("buyerBtn");
const sellerBtn = document.getElementById("sellerBtn");
const profileBtn = document.getElementById("profileBtn");
const calendarBtn = document.getElementById("calendarBtn");

function renderEvents() {
  if (events.length === 0) {
    eventsList.innerHTML = `
      <div class="empty-state">
        <h2>No events available</h2>
        <p>Please check again later.</p>
      </div>
    `;
    return;
  }

  eventsList.innerHTML = events
    .map((event) => {
      return `
        <article class="event-card">
          <div class="date-box">
            <div>
              <span class="day">${event.day}</span>
              <span class="month">${event.month}</span>
            </div>
          </div>

          <div class="event-info">
            <h2>${event.title}</h2>
            <p>${event.description}</p>
          </div>

          <button class="rsvp-btn" data-event-id="${event.id}">RSVP</button>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".rsvp-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const eventId = Number(button.dataset.eventId);
      const selectedEvent = events.find((event) => event.id === eventId);

      openEventModal(selectedEvent);
    });
  });
}

function openEventModal(event) {
  if (!event) return;

  modalContent.innerHTML = `
    <div class="modal-event">
      <h2>${event.title}</h2>

      <p>${event.description}</p>

      <div class="modal-tags">
        <span class="modal-tag">Date: ${event.month} ${event.day}</span>
        <span class="modal-tag">Time: ${event.time}</span>
        <span class="modal-tag">${event.type}</span>
      </div>

      <p>
        <strong>Location:</strong><br />
        ${event.location}
      </p>

      <div class="modal-actions">
        <button class="modal-btn red" id="confirmRsvpBtn">Confirm RSVP</button>
        <button class="modal-btn blue" id="detailsBtn">View Details</button>
      </div>
    </div>
  `;

  eventModal.classList.add("active");

  document.getElementById("confirmRsvpBtn").addEventListener("click", () => {
    showSuccess(
      "RSVP Confirmed",
      `You successfully RSVP'd for ${event.title} at ${event.location}.`
    );
  });

  document.getElementById("detailsBtn").addEventListener("click", () => {
    showSuccess(
      "Event Saved",
      `${event.title} has been added to your event list.`
    );
  });
}

function showSuccess(title, message) {
  modalContent.innerHTML = `
    <div class="modal-event">
      <h2>${title}</h2>
      <p>${message}</p>

      <div class="modal-actions">
        <button class="modal-btn blue" id="doneBtn">Done</button>
      </div>
    </div>
  `;

  document.getElementById("doneBtn").addEventListener("click", closeEventModal);
}

function closeEventModal() {
  eventModal.classList.remove("active");
}

function toggleRole(role) {
  const buyerSelected = role === "buyer";

  buyerBtn.classList.toggle("active", buyerSelected);
  sellerBtn.classList.toggle("active", !buyerSelected);
}

function initializeEventsPage() {
  renderEvents();

  closeModal.addEventListener("click", closeEventModal);

  eventModal.addEventListener("click", (event) => {
    if (event.target === eventModal) {
      closeEventModal();
    }
  });

  buyerBtn.addEventListener("click", () => toggleRole("buyer"));
  sellerBtn.addEventListener("click", () => toggleRole("seller"));

  profileBtn.addEventListener("click", () => {
    alert("Profile page coming soon.");
  });

  calendarBtn.addEventListener("click", () => {
    alert("Calendar view coming soon.");
  });
}

initializeEventsPage();