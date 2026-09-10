import './StatusBadge.css';

const StatusBadge = (props) => {
  return (
    <div className={`badge ${props.isAvailable ? 'badge-available' : 'badge-busy'}`}>
      <p>
        Status Badge: {props.isAvailable ? 'Open to work' : 'Busy learning'}
        </p>
    </div>
  );
};

export default StatusBadge;