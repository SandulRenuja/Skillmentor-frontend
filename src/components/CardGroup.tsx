import type { CardElement } from '../types'
import { Button } from './ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

export default function CardGroup({ CardElements }: { CardElements: CardElement[] }) {
  return (
    <div>
      <h1 className='text-4xl mb-6'>Schedule a Call</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {CardElements.map((cardProperties, index) => (
          <Card key={index}className="bg-black text-white p-4 rounded-2xl flex flex-col">
          <CardHeader>
            <CardTitle>{cardProperties.title}</CardTitle>
            <CardDescription>{cardProperties.description}</CardDescription>
          </CardHeader>     
          <CardFooter>
            <Button variant="secondary">Shedule a call</Button>
          </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}