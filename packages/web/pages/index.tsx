import Channel from "../components/common/Channel";
import RequiresUsername from "../components/common/RequiresUsername";

export default function Home() {
  return (
    <RequiresUsername>
      <main>
        <Channel channelId="test" />
      </main>
    </RequiresUsername>
  );
}
