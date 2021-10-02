import Head from "next/head";
import Channel from "../components/common/Channel";
import RequiresUsername from "../components/common/RequiresUsername";
import Button from "../components/widgets/Button";
import Input from "../components/widgets/Input";
import Label from "../components/widgets/Label";

export default function Home() {
  return (
    <RequiresUsername>
      <main>
        <Channel channelId="test" />
      </main>
    </RequiresUsername>
  );
}
