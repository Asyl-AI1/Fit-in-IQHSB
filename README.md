Fit in IQHSB
Overview
Fit in IQHSB is a browser-only, offline-first web application designed to help students, coaches, and staff at IQanat High School of Burabay manage fitness and nutrition plans. The app is a prototype that uses localStorage for all data persistence.

Features
Profile Management: Record and update personal metrics, fitness goals, and availability.

Equipment Inventory: An editable list of school gym equipment (admin/coach view).

Plan Generation: Generate a personalized 8-12 week training and nutritional plan based on profile data and available equipment.

History & Export: View and export saved plans in JSON format.

Safety Checks: Automatic flagging for coach review for minors or users with injuries.

Getting Started
To use this application, simply open index.html in a modern web browser. The app is designed to work offline once loaded.

Important Safety Notes
DISCLAIMER: This is a school tool and not a substitute for professional medical advice. All students, especially minors, must get coach or medical staff approval for any generated plan. The app automatically flags plans for review based on age and injury data.

Formulas Used
The nutritional plan uses the Mifflin-St Jeor formula for Basal Metabolic Rate (BMR) and a TDEE (Total Daily Energy Expenditure) calculation based on a user's activity level.

Mifflin-St Jeor Equation
For Men: BMR = (10 * weight in kg) + (6.25 * height in cm) - (5 * age in years) + 5

For Women: BMR = (10 * weight in kg) + (6.25 * height in cm) - (5 * age in years) - 161

Total Daily Energy Expenditure (TDEE)
TDEE = BMR * Activity Factor

Activity Level (based on weekly time)

Activity Factor

1-3 hours/week

1.375

3-5 hours/week

1.55

5-7 hours/week

1.725

>7 hours/week

1.9

Next Steps for the School
Implementation Checklist
Deployment: Host the files on a simple web server (e.g., Apache, Nginx) or a cloud service (e.g., Firebase Hosting, GitHub Pages) for easy access.

User Access: Provide a QR code or a short URL for students to access the app on their devices.

Admin Training: Train coaches and medical staff on how to use the equipment page and approve plans.

Future Improvements (Next Steps)
Server Sync: Replace localStorage with a server-side database (e.g., Firestore) to allow coaches and kitchen staff to access and approve plans in a centralized, secure manner. This would enable true multi-user functionality.

Coach/Staff Portal: Create a dedicated, password-protected portal for coaches and medical staff to review and approve plans and manage equipment centrally.

Kitchen Integration: Allow kitchen staff to view student nutritional plans to help tailor meals for specific goals.

School Calendar API: Integrate with the school's digital calendar to automatically import exam blackout periods, reducing manual entry.

User Authentication: Implement a secure authentication system (e.g., Firebase Auth) to protect user data and manage different user roles (student, coach, staff).