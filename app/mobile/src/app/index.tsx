import { NavigationIndependentTree } from '@react-navigation/native';
import App from '../../App';

/** Keep the team's existing authentication/feed stack and its state intact. */
export default function SummitRoute() {
  return (
    <NavigationIndependentTree>
      <App />
    </NavigationIndependentTree>
  );
}
