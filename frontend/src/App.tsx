import { Button, Card, Input } from './components/ui';
import { FiShoppingCart, FiHeart, FiSearch } from 'react-icons/fi';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="container">
        <h1 className="text-gradient">Cartify UI Components</h1>

        <section className="section">
          <h2>Buttons</h2>
          <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>

          <div className="flex gap-md mt-lg" style={{ flexWrap: 'wrap' }}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>

          <div className="flex gap-md mt-lg" style={{ flexWrap: 'wrap' }}>
            <Button leftIcon={<FiShoppingCart />}>Add to Cart</Button>
            <Button rightIcon={<FiHeart />} variant="outline">Wishlist</Button>
            <Button isLoading>Loading...</Button>
          </div>
        </section>

        <section className="section">
          <h2>Cards</h2>
          <div className="grid grid-cols-3 gap-lg">
            <Card hover>
              <h3>Default Card</h3>
              <p>This is a default card with hover effect.</p>
            </Card>

            <Card variant="glass" hover>
              <h3>Glass Card</h3>
              <p>Beautiful glassmorphism effect.</p>
            </Card>

            <Card variant="gradient">
              <h3>Gradient Card</h3>
              <p>Vibrant gradient background.</p>
            </Card>
          </div>
        </section>

        <section className="section">
          <h2>Inputs</h2>
          <div className="grid grid-cols-2 gap-lg">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
            />
            <Input
              label="Search Products"
              leftIcon={<FiSearch />}
              placeholder="Search..."
            />
            <Input
              label="Error State"
              error="This field is required"
              defaultValue="Invalid input"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
