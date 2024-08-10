const nodemailer = require("nodemailer");
const { format } = require("date-fns");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  port: 465, // true for 465, false for other ports
  host: "smtp.gmail.com",
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_EMAIL_PASSWORD,
  },
  secure: true,
});

const formatDateTime = (date, time) => {
  return format(new Date(date + " " + time), "MM/dd/yyyy hh:mm a");
};

const createCalendarLinks = (
  eventTitle,
  eventDescription,
  eventLocation,
  date,
  startTime,
  endTime
) => {
  const encodedTitle = encodeURIComponent(eventTitle);
  const encodedDescription = encodeURIComponent(eventDescription);
  const encodedLocation = encodeURIComponent(eventLocation);

  const [month, day, year] = date.split("-");
  const formattedDate = `${year}-${month}-${day}`;

  // Ensure startTime and endTime are in HH:mm:ss format
  const formattedStartTime = new Date(startTime)
    .toISOString()
    .split("T")[1]
    .split(".")[0];
  const formattedEndTime = new Date(endTime)
    .toISOString()
    .split("T")[1]
    .split(".")[0];

  // Combine date with start and end times
  const startDateTimeString = `${formattedDate}T${formattedStartTime}`;
  const endDateTimeString = `${formattedDate}T${formattedEndTime}`;

  const startDateTime = new Date(startDateTimeString);
  const endDateTime = new Date(endDateTimeString);

  // Check if the startDateTime and endDateTime are valid
  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    throw new Error(
      `Invalid date or time value: ${date}, ${startTime}, ${endTime}`
    );
  }

  const startISO = startDateTime.toISOString();
  const endISO = endDateTime.toISOString();

  // Generate the Google Calendar link
  const googleCalendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startISO.replace(
    /-|:|\.\d\d\d/g,
    ""
  )}/${endISO.replace(
    /-|:|\.\d\d\d/g,
    ""
  )}&details=${encodedDescription}&location=${encodedLocation}`;

  // Generate the Outlook Calendar link
  const outlookCalendarLink = `https://outlook.live.com/owa/?path=/calendar/action/compose&subject=${encodedTitle}&body=${encodedDescription}&startdt=${startISO}&enddt=${endISO}&location=${encodedLocation}`;
  // Generate the Apple Calendar (ICS) content
  const icsContent = `
  BEGIN:VCALENDAR
  VERSION:2.0
  PRODID:-//Your Company//NONSGML Your Product//EN
  BEGIN:VEVENT
  UID:${new Date().getTime()}@yourcompany.com
  DTSTAMP:${startISO.replace(/[-:]/g, "").split(".")[0]}Z
  DTSTART:${startISO.replace(/[-:]/g, "").split(".")[0]}Z
  DTEND:${endISO.replace(/[-:]/g, "").split(".")[0]}Z
  SUMMARY:${eventTitle}
  DESCRIPTION:${eventDescription}
  LOCATION:${eventLocation}
  END:VEVENT
  END:VCALENDAR
    `.trim();

  // Save ICS content to a file on the server
  const fs = require("fs");
  const path = require("path");
  const icsFileName = `event-${new Date().getTime()}.ics`;
  const icsFilePath = path.join(__dirname, "../../calendar", icsFileName);
  fs.writeFileSync(icsFilePath, icsContent);
  // Convert the ICS content to a Blob
  const icsBlob = new Blob([icsContent], { type: "text/calendar" });
  const icsUrl = URL.createObjectURL(icsBlob);

  // Generate the Apple Calendar link
  const appleCalendarLink = `${process.env.BASE_URL}/calendar/${icsFileName}`;
  return { googleCalendarLink, outlookCalendarLink, appleCalendarLink };
};

const sendEmail = async (demoUrl, data, demoDetails, startTime, endTime) => {
  let emailContent;
  const allSuccessFalse = data.every((site) => !site.success);
  const unsuccessfulScrapes = data.filter((site) => !site.success);
  const formattedDateTime = formatDateTime(
    demoDetails?.date,
    demoDetails?.time
  );
  const eventTitle = "Call with Olleh.AI";
  const eventDescription = `We're pleased to inform you that the content you submitted to olleh.ai has been successfully scraped and processed. Additionally, as requested during registration, we have scheduled your call with AI Agent on ${formattedDateTime}. In this time you will be talking to the AI Agent that has the information you gave it via content URLs. Please ensure you're available at the specified time.`;
  const { googleCalendarLink, outlookCalendarLink, appleCalendarLink } =
    createCalendarLinks(
      eventTitle,
      eventDescription,
      demoUrl,
      demoDetails?.date,
      // demoDetails?.time
      startTime,
      endTime
    );

  if (Array.isArray(data)) {
    if (allSuccessFalse) {
      // All sites were unsuccessful
      emailContent = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <div style="padding: 20px;">
                    <p>Dear <strong>${demoDetails?.clientName}</strong>,</p>
                    <p>Thank you for providing the data for training our AI model. Unfortunately, we were unable to process any of the provided websites.</p>
                    <p>Please review the data provided and try again with valid URLs.</p>
                    <ul>
                        ${unsuccessfulScrapes
                          .map(
                            (site) => `
                          <li>
                            <a href="${
                              site?.url
                            }" style="color: #b30000; text-decoration: none;">${
                              site?.url
                            }</a> - Reason: ${
                              site?.reason || "No reason provided"
                            }
                          </li>
                        `
                          )
                          .join("")}
                    </ul>
                    <p>Best regards,</p>
                    <img src="${
                      process.env.HOST_URL
                    }/uploads/olleh-logo.png" alt="Olleh.ai Logo" style="width: 100px; height: auto;"/>
                </div>
            </div>
        `;
    } else {
      const demoUrlText = "Click here for the demo link";
      emailContent = `
         <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <div style="padding: 20px;">
                    <p>Dear <strong>${demoDetails?.clientName}</strong>,</p>
                    <p>We're pleased to inform you that the content you submitted to Olleh.ai has been successfully scraped and processed. You can now find it on our platform using the following custom demo URL:</p>
                    <p><a href="${demoUrl}" style="color: #0056b3; text-decoration: none;">${demoUrlText}</a></p>

                    <p>Additionally, as requested during registration, we have scheduled your call with the AI Agent on <strong>${formattedDateTime}</strong>. During this time, you will be talking to the AI Agent that has the information you provided via content URLs. Please ensure you're available at the specified time.</p>
                    <p>To add this event to your calendar, please choose one of the options below:</p>
                    <p style="margin: 0;">
                         <a href="${googleCalendarLink}" target="_blank" style="color: #0056b3; text-decoration: none; margin-right: 15px;">
                        <img src="https://www.google.com/images/icons/product/calendar-16.png" alt="Google Calendar" style="vertical-align: middle; width: 24px; height: 24px; margin-right: 5px;"> Add to Google Calendar
                        </a>
                        <a href="${outlookCalendarLink}" target="_blank" style="color: #0056b3; text-decoration: none; margin-right: 15px;">
                          <img src="https://outlook.live.com/favicon.ico" alt="Outlook Calendar" style="vertical-align: middle; width: 24px; height: 24px; margin-right: 5px;"> Add to Outlook Calendar
                        </a>
                        <a href="${appleCalendarLink}" target="_blank" style="color: #0056b3; text-decoration: none;">
                          <img src="${process.env.HOST_URL}/uploads/calendar.png" alt="" style="vertical-align: middle; width: 24px; height: 24px; margin-right: 5px;"> Add to Apple Calendar
                        </a>
                    </p>
                    <p>Thank you for contributing to our community! If you have any further questions or need assistance, feel free to reach out.</p>
                    <p>Best regards,</p>
                    <img src="${process.env.HOST_URL}/uploads/olleh-logo.png" alt="Olleh.ai Logo" style="width: 100px; height: auto;"/>
                </div>
            </div>
        `;
    }
  }

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: demoDetails?.email,
    subject: allSuccessFalse
      ? "Content Scraping Unsuccessful | Olleh.ai"
      : "Content Processing Successful | Olleh.ai",
    html: emailContent,
  };

  return mailOptions;
};

const sendEmailToTeam = async (data) => {
  const formattedDateTime = formatDateTime(data?.date, data?.time);
  const eventTitle = "Client Call with Olleh.AI";
  const eventDescription = `
    Client details are:
    <strong>Name:</strong> ${data?.name}<br>
    <strong>Email:</strong> ${data?.email}<br>
    <strong>Content Type:</strong> ${data?.url_type}<br>
    <strong>Content URL:</strong> ${data?.urlsList}<br>
    <strong>Date and Time of Demo:</strong> ${formattedDateTime}
  `;

  const { googleCalendarLink, outlookCalendarLink, appleCalendarLink } =
    createCalendarLinks(
      eventTitle,
      eventDescription,
      data?.email,
      data?.date,
      data?.startTime,
      data?.endTime
    );

  let emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <div style="padding: 20px;">
        <p>Dear <strong>Admin</strong>,</p>
        <p>A new user has registered on on Olleh.ai. Below are the details provided by the user:</p>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Name:</strong> ${data?.name}</li>
          <li><strong>Email:</strong> ${data?.email}</li>
          <li><strong>Content Type:</strong> ${data?.url_type}</li>
          <li><strong>Content URL:</strong>
            <ul style="padding-left: 20px;">
              ${data?.urlsList}
            </ul>
          </li>
          <li><strong>Date and Time of Demo:</strong> ${formattedDateTime}</li>
        </ul>
        <p>Please review the details and follow up accordingly.</p>
        <p>To add this event to your calendar, please choose one of the options below:</p>
         <p style="margin: 0;">
            <a href="${googleCalendarLink}" target="_blank" style="color: #0056b3; text-decoration: none; margin-right: 15px;">
              <img src="https://www.google.com/images/icons/product/calendar-16.png" alt="Google Calendar" style="vertical-align: middle; width: 24px; height: 24px; margin-right: 5px;"> Add to Google Calendar
            </a>
            <a href="${outlookCalendarLink}" target="_blank" style="color: #0056b3; text-decoration: none; margin-right: 15px;">
              <img src="https://outlook.live.com/favicon.ico" alt="Outlook Calendar" style="vertical-align: middle; width: 24px; height: 24px; margin-right: 5px;"> Add to Outlook Calendar
            </a>
            <a href="${appleCalendarLink}" target="_blank" style="color: #0056b3; text-decoration: none;">
              <img src="https://developer.apple.com/assets/elements/icons/calendar/calendar-16x16.png" alt="" style="vertical-align: middle; width: 24px; height: 24px; margin-right: 5px;"> Add to Apple Calendar
            </a>
          </p>
          <p>Best regards,</p>
        <img src="${process.env.HOST_URL}/uploads/olleh-logo.png" alt="Olleh.ai Logo" style="width: 100px; height: auto;"/>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: process.env.TEAM_EMAILS.split(",").map((email) => email.trim()),
    subject: "New Registration on Olleh.ai",
    html: emailContent,
  };

  return mailOptions;
};

const sendContactEmail = async (data) => {
  const emailContent = `
   <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
  
    <div style="padding: 20px;">
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;"><strong>Name:</strong> ${data?.name}</p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;"><strong>Email:</strong> ${data?.email}</p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 10px;"><strong>Message:</strong></p>
        <p style="font-size: 16px; line-height: 1.5; border: 1px solid #ddd; padding: 10px; border-radius: 4px; background-color: #f9f9f9; margin-bottom: 20px;">${data?.message}</p>
        <img src="${process.env.HOST_URL}/uploads/olleh-logo.png" alt="Logo" style="width: 100px; height: auto;"/>
    </div>
</div>

  `;

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: process.env.SMTP_EMAIL,
    subject: "New Contact Form Submission | Olleh.ai",
    html: emailContent,
  };

  return mailOptions;
};

module.exports = { transporter, sendEmail, sendEmailToTeam, sendContactEmail };
