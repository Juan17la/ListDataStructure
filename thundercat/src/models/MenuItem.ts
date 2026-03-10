export class MenuItem {
  private name: string;
  private price: number;
  private category: string;

  constructor(name: string, price: number, category: string) {
    if (!name || price < 0 || !category) {
      throw new Error('Invalid MenuItem parameters');
    }
    this.name = name;
    this.price = price;
    this.category = category;
  }

  getName(): string {
    return this.name;
  }

  getPrice(): number {
    return this.price;
  }

  getCategory(): string {
    return this.category;
  }
}
