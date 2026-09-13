# MyApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Authentication

`/login` and `/signup` share the authentication page. Protected application routes
check Django's session; expired sessions return to login with an internal return URL.
No credentials or session tokens are stored in local storage.

Run Django on port 8000 and start Angular with `npm start`. The development proxy
forwards `/api` to Django, preserving the browser Host/Origin for CSRF checks.
Restart an existing Angular dev server after changing the proxy configuration.
Production hosting must route `/api` to Django on the frontend's origin and
serve Angular's index for frontend routes. Configure secure cookies and the
HTTPS proxy settings in Django for that deployment.

The backend's login, signup, and session responses expose the signed-in user as
`{pk, email, firstName, surname}`. `GET /api/auth/session` also initializes the
CSRF cookie and returns the public `googleClientId`. Set Django's
`GOOGLE_OAUTH_CLIENT_ID` to enable Google sign-in; register the frontend origin
in that Google OAuth web client. The button is rendered using Google's Identity
Services SDK: https://developers.google.com/identity/gsi/web/reference/js-reference
Email authentication remains available when Google is not configured or cannot load.

Authenticated application pages use the shared `app-topbar` component. Pages
project their own breadcrumb and action controls through the
`topbarBreadcrumbs` and `topbarActions` slots. Buttons with the `topbarAction`
directive share primary/secondary styling and collapse to labelled icon buttons
on narrow screens. The topbar always includes the session-backed user menu,
which renders the user's full name and initials, plus its CSRF-protected sign-out
action.

Focused authentication tests:
`npm test -- --configuration=auth --watch=false --browsers=ChromeHeadless`
