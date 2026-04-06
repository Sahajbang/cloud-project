import React from "react";

const GoogleCalendarWidget = () => {
  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-3">Google Calendar</h2>
      <iframe
        src="https://calendar.google.com/calendar/embed?src=your_calendar_id&ctz=Asia%2FKolkata"
        style={{ border: 0 }}
        width="100%"
        height="250"
        frameBorder="1"
        scrolling="no"
        title="Google Calendar"
      ></iframe>
    </div>
  );
};

export default GoogleCalendarWidget;

