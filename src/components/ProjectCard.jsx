import { Card, CardHeader, CardTitle, CardContent } from './ui/Card.jsx';
import Badge from './ui/Badge.jsx';
import { Button } from './ui/Button.jsx';

const ProjectCard = ({ title, status, url }) => {
  return (
    <Card className="w-full transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900">{title}</CardTitle>
        <Badge variant={status === 'Live' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        >
          View project
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;