import Presence from "../components/common/Presence";
import RequiresUsername from "../components/common/RequiresUsername";

export default function Home() {
  return (
    <RequiresUsername>
      <main>
        <Presence channelId="test" />
      </main>
    </RequiresUsername>
  );
}
