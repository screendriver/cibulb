import { shallowMount } from '@vue/test-utils';
import Bulb from '@/components/Bulb.vue';

describe('<light-bulb />', () => {
  it('should render correctly', () => {
    const wrapper = shallowMount(Bulb);
    expect(wrapper).toMatchSnapshot();
  });
});
