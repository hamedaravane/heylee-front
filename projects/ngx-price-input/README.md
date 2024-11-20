# ngx-price-input

`ngx-price-input` is an Angular component designed to display and handle currency inputs. It leverages `ng-zorro-antd` for styling and input formatting and provides a clean interface to input numeric values with currency symbols. The component is implemented as a standalone Angular component and follows Angular's ControlValueAccessor protocol, making it compatible with Reactive Forms.

## Features

- Displays a text input field with formatted numbers.
- Accepts various currency symbols.
- Handles input of numeric values with automatic formatting.
- Integrates with Angular forms via `ControlValueAccessor`.
- Supports three different sizes for the input field (`small`, `default`, and `large`).
- Based on `ng-zorro-antd`'s input module, making it visually appealing and easy to style.

## Installation

First, ensure that your project has `ng-zorro-antd` installed as a peer dependency.

1. Install the peer dependencies:

```bash
npm install ng-zorro-antd
```

2. Install the ngx-price-input package:

```bash
npm install ngx-price-input
```

## Usage

1. Import the required ng-zorro-antd modules in your application module
2. Add the ngx-price-input component to your template:

```html
<ngx-price-input [(ngModel)]="priceValue" [currency]="'$'" [size]="'large'"> </ngx-price-input>
```

3. In your component, define a model to bind to the input:

```typescript
export class AppComponent {
  priceValue: number | null = null;
}
```

## Inputs

- currency: A string representing the currency symbol. Default is 'ریال'.
- size: The size of the input. Options are 'large', 'default', and 'small'. Default is 'default'.

## Example

```html
<ngx-price-input [(ngModel)]="price" [currency]="'€'" [size]="'small'"> </ngx-price-input>
```

In this example, the input will display and handle numbers formatted as Euro (€) currency in a small-sized input field.

## Integration with Reactive Forms

The ngx-price-input component is fully compatible with Angular Reactive Forms. Here's an example of how to use it with a form group:

```typescript
export class AppComponent implements OnInit {
  form: FormGroup;

  ngOnInit() {
    this.form = new FormGroup({
      price: new FormControl(null)
    });
  }

  onSubmit() {
    console.log(this.form.value);
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <ngx-price-input formControlName="price" [currency]="'USD'" [size]="'default'"></ngx-price-input>
  <button type="submit">Submit</button>
</form>
```

## Peer Dependencies

Ensure that your project has the following dependencies installed:

- `ng-zorro-antd`: The UI library used for the input field and surrounding controls.
- `@angular/forms`: To integrate the component with Angular's forms system.

## Author

Hey, I'm Hamed Arghavan, the developer behind this library. I’m a frontend developer from Mashhad, Iran, and I love building cool, efficient solutions—especially with Angular. Feel free to reach out if you have any questions or just want to chat about coding, Angular, or anything tech-related!

- [Find me on LinkedIn](https://linkedin.com/in/aboutcolorpurple/)
- [Drop me an email](mailto:hamedaravane@gmail.com?subject=ngx-price-input)

## License

This project is licensed under the **MIT** License.
