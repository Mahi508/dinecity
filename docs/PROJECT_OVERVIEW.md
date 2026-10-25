DineCity — Complete Project Overview
1. Introduction
DineCity is a web-based restaurant discovery and digital advertising platform designed to connect customers with cafes, restaurants, and pubs in their city. The main idea behind DineCity is to combine a restaurant directory with a unique digital advertising marketplace inspired by the Million Dollar Homepage concept.

On this website, customers can discover nearby restaurants, explore cafes, find pubs, view business information, and check promotional offers. At the same time, restaurant and pub owners can register their businesses, purchase advertising space on a large interactive pixel wall, and promote their businesses to potential customers.

The website will be developed using Angular for the frontend, Spring Boot for the backend, REST APIs for communication, and PostgreSQL for database management. The initial launch will focus on one city, with the possibility of expanding to multiple cities in the future.
2. Main Idea of the Project
The most distinctive feature of DineCity is its one-million-pixel advertising wall.

Imagine a large digital canvas divided into one million small logical pixels, arranged in a grid of 1,000 rows and 1,000 columns. Businesses can purchase advertising space on this wall to display their logos, promotional images, brand names, or advertisements.

For example, a cafe owner might purchase a rectangular area of 20 × 20 pixels. A restaurant owner might purchase a larger area of 50 × 40 pixels. The price depends on the size of the selected area and the pricing rules established by the platform.

Once the purchase is completed and the advertisement is approved, the selected area displays the business's advertisement on the pixel wall. When a customer clicks on that advertisement, the website opens the corresponding business profile, where the customer can view its location, contact details, photos, menu, offers, and other information.

This creates a shared advertising space where businesses can promote themselves while customers discover places to visit.
3. Types of Users
DineCity will have three main types of users.
A. Customers
Customers are people who visit the website to discover places to eat, drink, or spend time with friends.

They can browse cafes, restaurants, and pubs, search for businesses by name, filter by category, explore different locations, view business profiles, and discover promotions displayed on the pixel wall.

For example, a customer visiting DineCity might search for cafes in their neighborhood, discover a newly opened coffee shop through its advertisement, view its photos and address, and decide to visit it.

Customers should be able to use the discovery features without purchasing advertising space.
B. Business Owners and Advertisers
Business owners are the primary paying customers of the advertising marketplace.

A cafe, restaurant, or pub owner can create an account, register their business, provide business details, upload photos, and manage their profile.

They can then visit the pixel wall, select an available advertising area, view the price, choose the type of advertisement, and complete the purchase.

After payment, they can submit their advertisement for approval. Once approved, it appears in the selected area of the wall.

Business owners can also access a dashboard to view their purchases, manage their advertisements, monitor campaign dates, and track how many times their advertisements have been viewed or clicked.
C. Administrator
The administrator manages the overall platform.

The administrator can review business registrations, approve or reject advertisements, manage users, configure pixel prices, monitor transactions, handle reported content, and review sales statistics.

This helps ensure that the website displays genuine businesses and appropriate advertisements.
4. How the Pixel Wall Works
The pixel wall is the central feature that makes DineCity different from a traditional restaurant directory.

The wall contains one million logical cells. Each cell has a position identified by its X and Y coordinates. Businesses purchase rectangular areas that occupy multiple cells.

For example, if an advertiser selects an area with a width of 20 pixels and a height of 20 pixels, the total area is:

20 × 20 = 400 logical pixels.

If the price is ₹10 per logical pixel, the total advertising cost would be ₹4,000 before any applicable taxes or fees. These figures are illustrative and can be changed according to the business model.

The website will show which areas are available and which areas have already been purchased or reserved. Customers can explore the wall, zoom in, zoom out, and click on advertisements.

The application must ensure that two businesses cannot purchase the same advertising area in conflicting periods. This is handled by the Spring Boot backend and database, not just by the visual display in Angular.

The actual grid will be rendered using HTML Canvas so that the website can display a million logical cells without creating a million separate user interface components.
5. Permanent Advertising and Temporary Campaigns
DineCity will support two types of advertising purchases.

Permanent advertising: A business purchases a particular area of the pixel wall for permanent placement under the platform's published terms. That area remains assigned to the business and cannot be sold to another business.

Time-limited advertising: A business rents an area for a specific period, such as one week or one month. When the campaign ends, the advertisement stops appearing, and the area becomes available for another campaign unless it is permanently owned or otherwise reserved.

For example, a restaurant might permanently purchase an advertising area to maintain long-term visibility. Another business might rent a different area for a weekend promotion or a one-month launch campaign.

The system must coordinate both purchase types carefully. A temporary campaign cannot occupy an area already assigned permanently to another business.
6. Restaurant and Business Discovery
In addition to the pixel wall, DineCity will provide a conventional business discovery section.

Each business will have its own profile page containing information such as:
- Business name and category.
- Address and city.
- Photos and logo.
- Contact details.
- Opening hours.
- Menu or service information.
- Website and social media links.
- Special offers and promotions.
- Map location and directions.
Customers can search and filter businesses by category, location, cuisine, and other relevant criteria.

This feature is important because the pixel wall attracts attention, while the business directory provides the detailed information customers need to choose a place to visit.

The two features will work together: a customer can discover a business through an advertisement and then visit its full profile to learn more.
7. Technology Used to Develop DineCity
The project will use a frontend-backend architecture.
Frontend: Angular
Angular will be responsible for the user interface. It will provide the homepage, restaurant listings, business profile pages, pixel wall, registration forms, owner dashboard, checkout screens, and administrator dashboard.

Angular will communicate with the backend through REST APIs and display the information received from the server.
Backend: Spring Boot
Spring Boot will contain the business logic and expose REST endpoints.

It will manage user authentication, business registrations, advertising inventory, pricing, reservations, order processing, payments, advertisement approval, and campaign expiration.

For example, when an advertiser selects an area on the pixel wall, Angular sends the selection to Spring Boot. The backend checks availability, calculates the price, and returns the result.
Database: PostgreSQL
PostgreSQL will store the application's permanent data, including users, businesses, cities, advertising orders, reservations, payments, advertisements, and campaign details.

It will also help protect the integrity of the inventory so that overlapping purchases cannot be confirmed incorrectly.
Additional technologies
Spring Security will protect the APIs and control user permissions. Spring Data JPA will simplify database access. Flyway will manage database schema changes. Image storage will hold business photos and advertising artwork, while a payment gateway such as Razorpay can handle payments in India.
8. How the Main Workflow Operates
Consider a restaurant owner who wants to advertise on DineCity.

First, the owner creates an account and registers the restaurant. The restaurant information is saved in the PostgreSQL database after validation.

Next, the owner opens the pixel wall and selects an available rectangular area. Angular sends the selected coordinates, dimensions, and purchase type to the Spring Boot API.

The backend checks whether the area is within the grid and whether it conflicts with existing purchases, active campaigns, or temporary reservations. If the area is available, the backend calculates the price and creates a temporary reservation.

The owner proceeds to payment. The payment gateway processes the transaction and notifies the backend of the result. Spring Boot verifies the payment notification before confirming the order.

The owner then uploads or submits the advertisement. If moderation is required, the advertisement remains unpublished until an administrator approves it.

After approval, the advertisement appears in the selected area of the pixel wall. Customers can click it to open the restaurant's profile.

When a temporary campaign reaches its end date, the system automatically stops displaying that campaign and releases the area for eligible future campaigns.

This workflow connects business registration, advertising inventory, payment processing, and customer discovery into one application.
9. Database Structure
The database will contain several related tables.

The users table stores account information and user roles. The cities table stores supported cities. The businesses table stores registered cafes, restaurants, and pubs.

The advertisements table stores advertisement details, including the image, destination, and approval status. The pixel_orders table records purchases. The order_areas table stores the coordinates, dimensions, and purchase type of each selected area.

The pixel_reservations table tracks areas temporarily held during checkout. The payments table stores transaction references and payment statuses. The ad_placements table connects purchased areas with advertisements displayed on the wall.

An additional analytics table can record advertisement impressions and clicks.

These tables allow the system to distinguish between a business, the advertisement it creates, the area it purchases, and the payment associated with that purchase.
10. REST APIs
The frontend and backend will communicate through REST endpoints.

For example, the application might provide an endpoint to retrieve businesses, another to retrieve a business profile, and another to load advertisements on a city's pixel wall.

Additional endpoints will support registering businesses, checking advertising availability, calculating prices, reserving areas, creating orders, initiating payments, and managing advertisements.

The backend will validate every important operation. Angular will not be allowed to decide whether an area is available, set the final purchase price, or mark an order as paid.

This separation makes the application more secure and prevents users from manipulating purchases through browser tools.
11. Security and Reliability
Since DineCity handles business accounts and paid advertising, security is an important part of the project.

Users must authenticate before accessing protected features. Business owners should only be able to manage their own businesses, advertisements, and orders. Administrators should have separate permissions.

Passwords must be securely hashed. Payment notifications must be verified. Uploaded images must be validated. Sensitive configuration values must not be stored in publicly accessible frontend code.

The system must also handle situations where two advertisers attempt to purchase the same area simultaneously. The backend should use database transactions and appropriate locking to ensure that only one conflicting purchase succeeds.

Payment processing must be idempotent, meaning repeated notifications for the same payment do not create duplicate orders.

These safeguards are essential for building trust with advertisers.
12. Development Plan
The project can be developed in several stages.

Stage 1: Project setup. Create the Angular application, Spring Boot backend, PostgreSQL database, initial schema, and development environment.

Stage 2: Authentication and business directory. Implement user registration, login, business profiles, categories, and search functionality.

Stage 3: Pixel wall. Build the interactive canvas, rectangle selection, zooming, inventory display, and price calculation.

Stage 4: Orders and payments. Implement temporary reservations, checkout, payment verification, permanent purchases, and timed campaigns.

Stage 5: Advertising management. Add image uploads, advertisement submission, admin approval, and automatic campaign expiration.

Stage 6: Dashboards and analytics. Build the business owner dashboard and administrator dashboard, including order history, impressions, clicks, and sales reporting.

Stage 7: Testing and deployment. Test security, concurrent purchases, payment failures, mobile usability, and performance. Deploy the application and launch it in the first city.

Once the first city is operating successfully, the platform can be expanded to additional cities using the same architecture.
13. Business Model
DineCity can generate revenue primarily through advertising.

The first revenue stream is the sale of permanent advertising areas. Businesses pay once to secure a designated area under the platform's permanent-placement terms.

The second revenue stream is time-limited advertising. Businesses pay to display promotions for a particular duration.

Additional revenue opportunities could include premium placements, featured business profiles, promotional campaigns, or enhanced analytics for advertisers.

The platform should clearly communicate prices, campaign durations, advertising terms, and refund policies before a customer makes a purchase.
14. Future Enhancements
After the initial version is successful, DineCity could introduce customer reviews, ratings, favorites, personalized recommendations, advanced location-based search, business verification, coupon management, loyalty programs, and mobile applications.

The advertising system could support seasonal campaigns, premium placement zones, campaign performance reports, and more advanced pricing models.

A multi-city architecture would allow businesses to advertise in their own city or expand their reach into other cities.

These features can be added gradually without delaying the initial release.
15. Conclusion
DineCity is a restaurant discovery platform combined with a digital advertising marketplace. Its main purpose is to help customers discover local cafes, restaurants, and pubs while giving business owners a distinctive way to promote their establishments through a shared million-pixel wall.

Angular will provide the interactive frontend, Spring Boot will manage the business logic and REST APIs, and PostgreSQL will maintain the application's data and advertising inventory.

The most important technical challenge is ensuring that permanent placements, timed campaigns, reservations, and payments work together without conflicting purchases. By designing this inventory system carefully and building the application in stages, DineCity can begin as a focused single-city product and gradually grow into a larger restaurant discovery and advertising platform.

In one sentence: DineCity is a city-based restaurant discovery website where customers find places to visit and businesses purchase digital advertising space on a million-pixel wall to showcase their brands and attract customers.