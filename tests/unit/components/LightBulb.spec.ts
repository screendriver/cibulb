import { shallowMount } from '@vue/test-utils';
import LightBulb from '@/components/LightBulb.vue';

describe('<light-bulb />', () => {
  it('should render correctly', () => {
    const wrapper = shallowMount(LightBulb);
    expect(wrapper).toMatchSnapshot();
  });
});
